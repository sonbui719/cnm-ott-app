require("dotenv").config({ override: true });
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
const CallHistory = require("./models/CallHistory");

const app = express();
const server = http.createServer(app); 
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const uploadStorage = process.env.AWS_BUCKET_NAME
  ? multerS3({
      s3: new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      }),
      bucket: process.env.AWS_BUCKET_NAME,
      acl: "public-read",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) { cb(null, `uploads/${Date.now()}-${file.originalname}`); }
    })
  : multer.diskStorage({
      destination: "uploads",
      filename: function (req, file, cb) { cb(null, `${Date.now()}-${file.originalname}`); }
    });

const upload = multer({ storage: uploadStorage });

app.post("/api/chat/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file" });
  const url = req.file.location || `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ url });
});

app.get("/", (req, res) => res.send("API đang chạy"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/chat", chatRoutes); 

app.post("/api/ai-chat", async (req, res) => {
  try {
    const { question, image, history } = req.body; 
    
    if (!question && !image) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập câu hỏi hoặc gửi ảnh cho AI." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "Lỗi hệ thống: Chưa cấu hình API Key." });
    }

    let contents = [];

    if (history && Array.isArray(history)) {
      let safeHistory = [...history];
      while (safeHistory.length > 0 && safeHistory[0].role === "model") {
        safeHistory.shift(); 
      }

      contents = safeHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text || "" }]
      }));
    }

    let currentParts = [];

    if (question) {
      currentParts.push({ text: String(question) });
    }

    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      currentParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    if (currentParts.length > 0) {
      contents.push({
        role: "user",
        parts: currentParts
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    console.log("Using API Key:", apiKey);
    console.log("AI Chat URL:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: contents }) 
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google AI Error:", JSON.stringify(data, null, 2));
      return res.status(500).json({ success: false, message: "Lỗi AI từ Google.", error: data });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    res.status(200).json({ 
      success: true, 
      answer: aiResponse 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "AI đang bận, thử lại sau nhé!" 
    });
  }
});

app.post("/api/ai-suggest-reply", async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ success: false, message: "Missing context" });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
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
    console.log("Suggestion API Response:", textResponse);
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      return res.status(500).json({ success: false, message: "Invalid JSON from Google" });
    }

    if (!data.candidates) {
      return res.status(200).json({ 
        success: true, 
        suggestions: ["Ok bạn", "Cảm ơn nhé", "Để mình kiểm tra lại"] 
      });
    }

    let answer = data.candidates[0].content.parts[0].text;
    answer = answer.replace(/```json/g, '').replace(/```/g, '').trim();
    let suggestions = [];
    try {
      suggestions = JSON.parse(answer);
    } catch (e) {
      suggestions = ["OK", "Vâng", "Tuyệt vời"]; 
    }

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const CALL_INVITE_TIMEOUT_MS = 30 * 1000;
const callParticipants = new Map();
const activeUsers = new Map();
const socketUsers = new Map();
const callTimers = new Map();

const getCallParticipants = (callId) => {
  const key = String(callId);
  if (!callParticipants.has(key)) callParticipants.set(key, new Map());
  return callParticipants.get(key);
};

const removeCallParticipant = (callId, socketId) => {
  const key = String(callId);
  const participants = callParticipants.get(key);
  if (!participants) return 0;

  participants.delete(socketId);
  if (!participants.size) {
    callParticipants.delete(key);
    return 0;
  }

  return participants.size;
};

const addActiveUser = (userId, socketId) => {
  if (!userId) return;
  const key = String(userId);
  if (!activeUsers.has(key)) activeUsers.set(key, new Set());
  activeUsers.get(key).add(socketId);
  socketUsers.set(socketId, key);
};

const removeActiveUser = (socketId) => {
  const userId = socketUsers.get(socketId);
  if (!userId) return;

  const sockets = activeUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (!sockets.size) activeUsers.delete(userId);
  }

  socketUsers.delete(socketId);
};

const isUserOnline = (userId) => {
  const sockets = activeUsers.get(String(userId));
  return !!sockets?.size;
};

const clearCallTimer = (callId) => {
  const key = String(callId || "");
  const timer = callTimers.get(key);
  if (timer) clearTimeout(timer);
  callTimers.delete(key);
};

const finishCallHistory = async (callId, status) => {
  const history = await CallHistory.findOne({ callId });
  if (!history) return;

  const endedAt = new Date();
  const durationSeconds = history.answeredAt
    ? Math.max(0, Math.round((endedAt.getTime() - history.answeredAt.getTime()) / 1000))
    : 0;

  await CallHistory.updateOne(
    { callId },
    { status, endedAt, durationSeconds }
  );
};

const scheduleCallTimeout = (callPayload, targetUserIds) => {
  const callId = String(callPayload.callId || "");
  if (!callId) return;

  clearCallTimer(callId);
  const timer = setTimeout(async () => {
    try {
      const history = await CallHistory.findOne({ callId });
      if (!history || history.status !== "ringing") return;

      await CallHistory.updateOne(
        { callId },
        {
          status: "missed",
          endedAt: new Date(),
          $addToSet: { missedBy: { $each: targetUserIds } },
        }
      );

      await saveCallMessage(callPayload, "missed", { endedAt: new Date() });

      io.to(String(callPayload.callerId)).emit("call_timeout", {
        ...callPayload,
        message: "Không có phản hồi sau 30 giây",
      });

      targetUserIds.forEach((userId) => {
        io.to(String(userId)).emit("call_missed", callPayload);
      });
    } catch (error) {
      console.error("call timeout error:", error);
    } finally {
      callTimers.delete(callId);
    }
  }, CALL_INVITE_TIMEOUT_MS);

  callTimers.set(callId, timer);
};

const getCallLastMessageText = (callType, status) => {
  const label = callType === "video" ? "video" : "thoại";

  if (status === "missed") return `Cuộc gọi ${label} nhỡ`;
  if (status === "unavailable") return `Cuộc gọi ${label} không thành công`;
  if (status === "rejected") return `Cuộc gọi ${label} bị từ chối`;
  if (status === "ringing") return `Đang gọi ${label}`;
  return `Cuộc gọi ${label}`;
};

const saveCallMessage = async (callPayload, status, extra = {}) => {
  const callId = String(callPayload?.callId || "");
  const conversationId = callPayload?.conversationId;

  if (!callId || !conversationId) return null;

  const existing = await Message.findOne({
    conversationId,
    fileType: "call",
    "callInfo.callId": callId,
  });

  const callerId = callPayload?.callerId || existing?.sender;
  if (!callerId) return null;

  const callType = callPayload?.callType === "video" ? "video" : "audio";
  const text = getCallLastMessageText(callType, status);
  const callInfo = {
    ...(existing?.callInfo || {}),
    callId,
    callType,
    status,
    isGroupCall: !!callPayload?.isGroupCall,
    durationSeconds: extra.durationSeconds || existing?.callInfo?.durationSeconds || 0,
    callerId,
    callerName: callPayload?.callerName || existing?.callInfo?.callerName || "",
    endedAt: extra.endedAt || existing?.callInfo?.endedAt || null,
  };

  const message = existing
    ? await Message.findByIdAndUpdate(
        existing._id,
        { text, callInfo },
        { new: true }
      ).populate("sender", "fullName avatar")
    : await Message.create({
        conversationId,
        sender: callerId,
        text,
        fileType: "call",
        callInfo,
        status: "sent",
      }).then((created) =>
        Message.findById(created._id).populate("sender", "fullName avatar")
      );

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    $set: { deletedBy: [] },
  });

  const conversation = await Conversation.findById(conversationId).select("participants");
  const targetRooms = [String(conversationId)];
  conversation?.participants?.forEach((participantId) => {
    targetRooms.push(String(participantId));
  });

  io.to(targetRooms).emit(existing ? "call_message_updated" : "receive_message", message);
  return message;
};

io.on("connection", (socket) => {
  socket.on("user_connected", (userId) => {
    if (!userId) return;
    const key = String(userId);
    addActiveUser(key, socket.id);
    socket.join(key);
  });
  socket.on("join_chat", (chatId) => socket.join(chatId));

  socket.on("call_user", async (data) => {
    try {
      const conversation = await Conversation.findById(data.conversationId)
        .select("participants isGroupChat")
        .populate("participants", "fullName");
      if (!conversation) {
        socket.emit("call_unavailable", {
          ...data,
          fatal: true,
          message: "Không tìm thấy cuộc trò chuyện",
        });
        return;
      }

      const callPayload = {
        ...data,
        callId: data.callId || `${data.conversationId}-${Date.now()}`,
        expiresAt: Date.now() + CALL_INVITE_TIMEOUT_MS,
      };

      const callerId = String(data.callerId || "");
      const participants = conversation.participants || [];
      const targetUsers = participants.filter(
        (participant) => String(participant._id) !== callerId
      );
      const onlineTargets = targetUsers.filter((participant) => isUserOnline(participant._id));
      const offlineTargets = targetUsers.filter((participant) => !isUserOnline(participant._id));
      const allParticipantIds = participants.map((participant) => participant._id);

      await CallHistory.findOneAndUpdate(
        { callId: callPayload.callId },
        {
          $setOnInsert: {
            callId: callPayload.callId,
            startedAt: new Date(),
          },
          $set: {
            conversation: data.conversationId,
            caller: callerId,
            participants: allParticipantIds,
            callType: data.callType === "video" ? "video" : "audio",
            isGroupCall: !!data.isGroupCall,
            status: onlineTargets.length ? "ringing" : "unavailable",
            ...(onlineTargets.length ? {} : { endedAt: new Date() }),
          },
          $addToSet: {
            unavailableBy: { $each: offlineTargets.map((participant) => participant._id) },
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );

      await saveCallMessage(
        callPayload,
        onlineTargets.length ? "ringing" : "unavailable",
        onlineTargets.length ? {} : { endedAt: new Date() }
      );

      if (offlineTargets.length) {
        socket.emit("call_unavailable", {
          ...callPayload,
          fatal: onlineTargets.length === 0,
          users: offlineTargets.map((participant) => ({
            id: String(participant._id),
            name: participant.fullName || "Người dùng",
          })),
          message:
            onlineTargets.length === 0
              ? "Người nhận đang không hoạt động"
              : "Một số thành viên đang không hoạt động",
        });
      }

      if (!onlineTargets.length) return;

      const targetRooms = onlineTargets.map((participant) => String(participant._id));
      io.to(targetRooms).emit("incoming_call", callPayload);

      scheduleCallTimeout(
        callPayload,
        onlineTargets.map((participant) => participant._id)
      );
    } catch (error) {
      console.error("call_user error:", error);
      socket.emit("call_unavailable", {
        ...data,
        fatal: true,
        message: "Không thể bắt đầu cuộc gọi",
      });
    }
  });

  socket.on("accept_call", async (data) => {
    const callId = String(data?.callId || data?.conversationId || "");
    clearCallTimer(callId);
    if (callId && data?.acceptedUserId) {
      const existingHistory = await CallHistory.findOne({ callId }).select("status isGroupCall");
      const canAccept =
        !existingHistory ||
        existingHistory.status === "ringing" ||
        (existingHistory.isGroupCall && existingHistory.status === "answered");

      if (!canAccept) {
        io.to(socket.id).emit("call_timeout", {
          ...data,
          message: "Cuộc gọi đã hết hạn",
        });
        return;
      }

      await CallHistory.updateOne(
        { callId },
        {
          status: "answered",
          $setOnInsert: {
            callId,
            conversation: data.conversationId,
            caller: data.callerId,
            participants: [data.callerId, data.acceptedUserId].filter(Boolean),
            callType: data.callType === "video" ? "video" : "audio",
            isGroupCall: !!data.isGroupCall,
            startedAt: new Date(),
          },
          $set: { answeredAt: new Date() },
          $addToSet: { answeredBy: data.acceptedUserId },
        },
        { upsert: true }
      );

      await saveCallMessage(data, "answered");
    }

    if (data?.callerId) {
      io.to(String(data.callerId)).emit("call_accepted", data);
    }
  });

  socket.on("reject_call", async (data) => {
    const callId = String(data?.callId || data?.conversationId || "");
    if (!data?.isGroupCall) clearCallTimer(callId);
    if (callId && data?.rejectedUserId) {
      await CallHistory.updateOne(
        { callId },
        {
          status: data?.isGroupCall ? "ringing" : "rejected",
          ...(data?.isGroupCall ? {} : { endedAt: new Date() }),
          $addToSet: { rejectedBy: data.rejectedUserId },
        }
      );

      await saveCallMessage(data, data?.isGroupCall ? "ringing" : "rejected", {
        ...(data?.isGroupCall ? {} : { endedAt: new Date() }),
      });
    }

    if (data?.callerId) {
      io.to(String(data.callerId)).emit("call_rejected", data);
    }
  });

  socket.on("call_joined", (data) => {
    const callId = String(data?.callId || data?.conversationId || "");
    if (!callId) return;

    const callRoom = `call:${callId}`;
    const participants = getCallParticipants(callId);
    const existingPeers = Array.from(participants.values()).filter(
      (participant) => participant.senderSocketId !== socket.id
    );

    socket.join(callRoom);

    const payload = {
      ...data,
      callId,
      senderSocketId: socket.id,
      participantCount: existingPeers.length + 1,
    };

    participants.set(socket.id, payload);

    socket.emit("call_ready", payload);
    existingPeers.forEach((peer) => {
      socket.emit("call_peer_joined", {
        ...peer,
        participantCount: participants.size,
      });
    });
    socket.to(callRoom).emit("call_peer_joined", payload);
  });

  socket.on("webrtc_offer", (data) => {
    const callId = String(data?.callId || "");
    if (!callId) return;

    if (data?.targetSocketId) {
      io.to(String(data.targetSocketId)).emit("webrtc_offer", {
        ...data,
        senderSocketId: socket.id,
      });
      return;
    }

    socket.to(`call:${callId}`).emit("webrtc_offer", {
      ...data,
      senderSocketId: socket.id,
    });
  });

  socket.on("webrtc_answer", (data) => {
    const callId = String(data?.callId || "");
    if (!callId) return;

    if (data?.targetSocketId) {
      io.to(String(data.targetSocketId)).emit("webrtc_answer", {
        ...data,
        senderSocketId: socket.id,
      });
      return;
    }

    socket.to(`call:${callId}`).emit("webrtc_answer", {
      ...data,
      senderSocketId: socket.id,
    });
  });

  socket.on("webrtc_ice_candidate", (data) => {
    const callId = String(data?.callId || "");
    if (!callId) return;

    if (data?.targetSocketId) {
      io.to(String(data.targetSocketId)).emit("webrtc_ice_candidate", {
        ...data,
        senderSocketId: socket.id,
      });
      return;
    }

    socket.to(`call:${callId}`).emit("webrtc_ice_candidate", {
      ...data,
      senderSocketId: socket.id,
    });
  });

  socket.on("call_end", async (data) => {
    const callId = String(data?.callId || "");
    if (!callId) return;
    clearCallTimer(callId);

    const callRoom = `call:${callId}`;
    socket.leave(callRoom);
    const participantCount = removeCallParticipant(callId, socket.id);
    if (!participantCount) {
      finishCallHistory(callId, "ended").catch((error) =>
        console.error("finish call history error:", error)
      );
      CallHistory.findOne({ callId })
        .then((history) => {
          const endedAt = new Date();
          const durationSeconds = history?.answeredAt
            ? Math.max(0, Math.round((endedAt.getTime() - history.answeredAt.getTime()) / 1000))
            : 0;
          return saveCallMessage(data, "ended", { endedAt, durationSeconds });
        })
        .catch((error) => console.error("save call message error:", error));
    }

    socket.to(callRoom).emit("call_peer_left", {
      ...data,
      callId,
      senderSocketId: socket.id,
      participantCount,
    });
  });

  socket.on("disconnecting", () => {
    removeActiveUser(socket.id);
    socket.rooms.forEach((room) => {
      if (!String(room).startsWith("call:")) return;

      const callId = String(room).replace(/^call:/, "");
      const participantCount = removeCallParticipant(callId, socket.id);
      socket.to(room).emit("call_peer_left", {
        callId,
        senderSocketId: socket.id,
        participantCount,
      });
    });
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

  socket.on("unsend_message", (data) => {
    io.to(data.conversationId).emit("message_unsent_receive", data.msgId);
  });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => server.listen(PORT, () => console.log(`Server chạy port ${PORT}`)));

