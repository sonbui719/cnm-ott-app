require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 
const connectDB = require("./config/db");
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
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => res.send("API đang chạy"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/chat", chatRoutes); 

app.post("/api/ai-chat", async (req, res) => {
  try {
    const { question } = req.body; 
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: String(question) }] }] }) });
    const data = await response.json();
    res.status(200).json({ success: true, answer: data.candidates[0].content.parts[0].text });
  } catch (error) { res.status(500).json({ success: false, message: "AI đang bận!" }); }
});

io.on("connection", (socket) => {
  socket.on("user_connected", (userId) => socket.join(userId));
  socket.on("join_chat", (chatId) => socket.join(chatId));

  socket.on("call_user", (data) => socket.to(data.conversationId).emit("incoming_call", data));

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

  socket.on("unsend_message", (data) => {
    io.to(data.conversationId).emit("message_unsent_receive", data.msgId);
  });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => server.listen(PORT, () => console.log(`Server chạy port ${PORT}`)));

