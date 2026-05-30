// --- ĐƯA DOTENV LÊN TRÊN CÙNG ĐỂ ĐẢM BẢO ĐỌC ĐƯỢC API KEY ---
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
const connectDB = require("./config/db");
// Import routes
const multer = require("multer"); 
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
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

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read", 
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) { cb(null, `uploads/${Date.now()}-${file.originalname}`); }
  })
});

app.post("/api/chat/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file" });
  res.status(200).json({ url: req.file.location });
});

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

// Thêm endpoint AI Quick Reply
let lastSuggestTime = 0;
app.post("/api/ai-suggest-reply", async (req, res) => {
  const now = Date.now();
  if (now - lastSuggestTime < 3000) {
    // Chặn gọi API liên tục dưới 3 giây để tránh kiệt sức API Key
    return res.status(200).json({ 
      success: true, 
      suggestions: ["Ok bạn", "Cảm ơn nhé", "Để mình kiểm tra lại"] 
    });
  }
  lastSuggestTime = now;
  
  console.log(`[${new Date().toISOString()}] Gọi API gợi ý AI...`);
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ success: false, message: "Missing context" });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    
    const prompt = `You are a helpful chat assistant inside a messaging app. The user just received new messages. Based on the context, generate 3 short, natural, and conversational quick replies that the user can send back in Vietnamese.
Return ONLY a valid JSON array of 3 strings. Do not include markdown formatting like \`\`\`json.
Recent messages:
${context}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      console.error("Lỗi parse JSON suggest-reply:", textResponse);
      return res.status(500).json({ success: false, message: "Invalid JSON from Google" });
    }

    if (!data.candidates) {
      console.error("Gemini API Error (suggest):", data.error?.message);
      // Trả về gợi ý dự phòng (fallback) nếu API bị quá tải hoặc lỗi
      return res.status(200).json({ 
        success: true, 
        suggestions: ["Ok bạn", "Cảm ơn nhé", "Để mình kiểm tra lại"] 
      });
    }

    let answer = data.candidates[0].content.parts[0].text;
    // Làm sạch chuỗi trả về để tránh lỗi parse
    answer = answer.replace(/```json/g, '').replace(/```/g, '').trim();
    let suggestions = [];
    try {
      suggestions = JSON.parse(answer);
    } catch (e) {
      console.error("Lỗi parse suggestions mảng:", answer);
      suggestions = ["OK", "Vâng", "Tuyệt vời"]; // Fallback an toàn
    }

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error("Lỗi AI suggest-reply:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

  socket.on("call_user", async (data) => {
    try {
      const conversation = await Conversation.findById(data.conversationId).select("participants");
      const targetRooms = [String(data.conversationId)];
      const callPayload = {
        ...data,
        callId: data.callId || `${data.conversationId}-${Date.now()}`,
      };

      conversation?.participants?.forEach((participantId) => {
        const participantRoom = String(participantId);
        if (participantRoom !== String(data.callerId || "")) {
          targetRooms.push(participantRoom);
        }
      });

      socket.to(targetRooms).emit("incoming_call", callPayload);
    } catch (error) {
      console.error("call_user error:", error);
      socket.to(data.conversationId).emit("incoming_call", data);
    }
  });

  socket.on("accept_call", (data) => {
    if (data?.callerId) {
      io.to(String(data.callerId)).emit("call_accepted", data);
    }
  });

  socket.on("reject_call", (data) => {
    if (data?.callerId) {
      io.to(String(data.callerId)).emit("call_rejected", data);
    }
  });

  socket.on("mark_seen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany({ conversationId, sender: { $ne: userId }, status: "sent" }, { status: "seen" });
      socket.to(conversationId).emit("messages_seen", { conversationId });
    } catch (error) { console.error(error); }
  });

  socket.on("send_message", async (data) => {
    try {
      const newMessage = await Message.create({
        conversationId: data.conversationId, sender: data.senderId,
        text: data.text || "", fileUrl: data.fileUrl || null, fileType: data.fileType || null, status: "sent"
      });
      const populatedMessage = await Message.findById(newMessage._id).populate("sender", "fullName avatar");
      
      let lastMsgText = data.text;
      if (data.fileType === 'image') lastMsgText = "Đã gửi một ảnh";
      if (data.fileType === 'audio') lastMsgText = "Đã gửi tin nhắn thoại";

      // Reset array deletedBy để đoạn chat nổi lên lại
      const updatedConversation = await Conversation.findByIdAndUpdate(
        data.conversationId,
        { lastMessage: lastMsgText, $set: { deletedBy: [] } },
        { new: true }
      ).select("participants");

      // Gửi vào phòng chat và cả phòng riêng của từng user để người đang ở màn hình danh sách vẫn nhận được thông báo.
      // Socket.IO sẽ tự chống gửi trùng nếu một socket đang ở nhiều phòng trong danh sách này.
      const targetRooms = [String(data.conversationId)];
      updatedConversation?.participants?.forEach((participantId) => {
        targetRooms.push(String(participantId));
      });

      io.to(targetRooms).emit("receive_message", populatedMessage);
    } catch (error) { console.error(error); }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Ngắt kết nối:", socket.id);
  });

  socket.on("unsend_message", (data) => {
    io.to(data.conversationId).emit("message_unsent_receive", data.msgId);
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
