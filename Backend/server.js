const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); 
const { Server } = require("socket.io"); 
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); 
const chatRoutes = require("./routes/chatRoutes"); 
const Message = require("./models/Message"); 
const Conversation = require("./models/Conversation");

dotenv.config();

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