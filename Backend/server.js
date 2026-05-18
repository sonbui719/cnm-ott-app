// --- ĐƯA DOTENV LÊN TRÊN CÙNG ĐỂ ĐẢM BẢO ĐỌC ĐƯỢC API KEY ---
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); 
const chatRoutes = require("./routes/chatRoutes"); 
const Message = require("./models/Message"); 
const Conversation = require("./models/Conversation");

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
// Tăng giới hạn dung lượng tải lên cho hình ảnh (ví dụ: 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => {
  res.send("API đang chạy");
});

// Đăng ký API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/chat", chatRoutes); 

// --- 2. VIẾT ROUTE XỬ LÝ AI Ở ĐÂY (ĐÃ NÂNG CẤP LỊCH SỬ & HÌNH ẢNH) ---
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { question, image, history } = req.body; 
    
    console.log("--- NHẬN YÊU CẦU TỪ APP ---");
    console.log("Có nhận được text không:", !!question);
    console.log("Có nhận được ảnh không:", !!image);
    console.log("Độ dài lịch sử chat (trước khi lọc):", history ? history.length : 0);

    // Kiểm tra xem có gửi lên dữ liệu gì không
    if (!question && !image) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập câu hỏi hoặc gửi ảnh cho AI." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("🚨 LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env");
      return res.status(500).json({ success: false, message: "Lỗi hệ thống: Chưa cấu hình API Key." });
    }

    // --- BƯỚC 1: Xây dựng mảng contents từ lịch sử chat ---
    let contents = [];

    // Nếu có lịch sử, map nó sang chuẩn của Google (role và parts)
    if (history && Array.isArray(history)) {
      // FIX LỖI GOOGLE: Google bắt buộc lịch sử phải bắt đầu bằng 'user'. 
      // Nếu tin nhắn đầu tiên là của 'model' (câu chào), ta phải cắt bỏ nó đi.
      let safeHistory = [...history];
      while (safeHistory.length > 0 && safeHistory[0].role === "model") {
        safeHistory.shift(); 
      }

      contents = safeHistory.map(msg => ({
        role: msg.role, // "user" hoặc "model"
        parts: [{ text: msg.text || "" }]
      }));
    }

    // --- BƯỚC 2: Chuẩn bị nội dung cho tin nhắn hiện tại ---
    let currentParts = [];

    // Thêm text nếu có
    if (question) {
      currentParts.push({ text: String(question) });
    }

    // Thêm hình ảnh nếu có
    if (image) {
      // Xoá tiền tố "data:image/jpeg;base64," nếu expo-image-picker vô tình gửi kèm
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      currentParts.push({
        inlineData: {
          mimeType: "image/jpeg", // Mặc định để jpeg để AI dễ đọc
          data: base64Data
        }
      });
    }

    // Push tin nhắn mới nhất này vào mảng contents với role là "user"
    if (currentParts.length > 0) {
      contents.push({
        role: "user",
        parts: currentParts
      });
    }

const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: contents }) // Gửi toàn bộ mảng contents đã build
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🚨 CHI TIẾT LỖI TỪ GOOGLE:", JSON.stringify(data, null, 2));
      return res.status(500).json({ success: false, message: "Lỗi AI từ Google." });
    }

    // Trích xuất câu trả lời thành công
    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log("✅ AI trả lời thành công!");

    // Trả kết quả về cho ứng dụng điện thoại
    res.status(200).json({ 
      success: true, 
      answer: aiResponse 
    });

  } catch (error) {
    console.error("🚨 Lỗi Server (Code Backend):", error);
    res.status(500).json({ 
      success: false, 
      message: "AI đang bận, thử lại sau nhé!" 
    });
  }
});

// --- XỬ LÝ REAL-TIME VỚI SOCKET.IO ---
io.on("connection", (socket) => {
  console.log("🟢 Bật kết nối Socket:", socket.id);

  socket.on("user_connected", (userId) => {
    socket.join(userId); 
    console.log(`User ${userId} online`);
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User đã vào phòng chat: ${chatId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const newMessage = await Message.create({
        conversationId: data.conversationId,
        sender: data.senderId,
        text: data.text,
      });

      // Populate sender để Frontend có thông tin người gửi
      const populatedMessage = await Message.findById(newMessage._id).populate("sender", "fullName avatar");

      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: data.text,
      });

      io.to(data.conversationId).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn socket:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Ngắt kết nối:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server chạy port ${PORT} - Socket.io Sẵn sàng!`);
    });
  } catch (error) {
    console.error("Start server error:", error.message);
  }
};

startServer();