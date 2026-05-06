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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API đang chạy");
});

// Đăng ký API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/chat", chatRoutes); 

// --- 2. VIẾT ROUTE XỬ LÝ AI Ở ĐÂY (PHIÊN BẢN CỰC KỲ ỔN ĐỊNH) ---
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { question } = req.body; 
    
    console.log("--- NHẬN YÊU CẦU TỪ APP ---");
    console.log("Dữ liệu gốc gửi lên:", question);

    // Nếu người dùng không gửi câu hỏi
    if (!question) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập câu hỏi cho AI." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("🚨 LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env");
      return res.status(500).json({ success: false, message: "Lỗi hệ thống: Chưa cấu hình API Key." });
    }

    // BƯỚC QUAN TRỌNG: Ép kiểu dữ liệu thành chuỗi (String) để chống lỗi từ app Android
    const safeQuestion = String(question);

// Sửa lại dòng URL chính xác như sau:
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: safeQuestion }] }]
      })
    });

    const data = await response.json();

    // Nếu Google báo lỗi (ví dụ: hết quota, sai key...), in chi tiết lỗi ra Terminal
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