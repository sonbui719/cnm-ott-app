const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const populateChat = (query) =>
  query
    .populate("participants", "fullName phone email avatar department position intro birthday address")
    .populate("groupAdmin", "fullName phone email avatar department position intro");

const isSameId = (left, right) => String(left || "") === String(right || "");

const assertGroupMember = async (chatId, userId) => {
  const chat = await Conversation.findById(chatId);
  if (!chat || !chat.isGroupChat) {
    const error = new Error("Không tìm thấy nhóm");
    error.statusCode = 404;
    throw error;
  }

  const isMember = chat.participants.some((participantId) => isSameId(participantId, userId));
  if (!isMember) {
    const error = new Error("Bạn không thuộc nhóm này");
    error.statusCode = 403;
    throw error;
  }

  return chat;
};

const assertGroupAdmin = async (chatId, userId) => {
  const chat = await assertGroupMember(chatId, userId);
  if (!isSameId(chat.groupAdmin, userId)) {
    const error = new Error("Chỉ nhóm trưởng mới có quyền thực hiện");
    error.statusCode = 403;
    throw error;
  }

  return chat;
};

const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "Thiếu userId" });
  try {
    let chat = await Conversation.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, userId] },
    }).populate("participants", "fullName phone email avatar");

    if (chat) return res.status(200).json(chat);

    const newChat = await Conversation.create({ participants: [req.user._id, userId], isGroupChat: false });
    const fullChat = await Conversation.findById(newChat._id).populate("participants", "fullName phone email avatar");
    return res.status(200).json(fullChat);
  } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ 
      conversationId: req.params.chatId,
      deletedBy: { $ne: req.user._id } // Lọc bỏ tin đã xóa
    })
      .populate("sender", "fullName avatar")
      .sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
};

const getChatById = async (req, res) => {
  try {
    const chat = await populateChat(Conversation.findById(req.params.chatId));

    if (!chat) return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });

    const isMember = chat.participants.some((participant) =>
      isSameId(participant._id, req.user._id)
    );

    if (!isMember) return res.status(403).json({ message: "Không có quyền truy cập" });

    return res.status(200).json(chat);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await Conversation.find({ 
      participants: { $elemMatch: { $eq: req.user._id } },
      deletedBy: { $ne: req.user._id } // Lọc bỏ chat đã xóa
    })
      .populate("participants", "fullName phone email avatar")
      .populate("groupAdmin", "fullName phone email avatar")
      .sort({ updatedAt: -1 }); 
    res.status(200).json(chats);
  } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
};

const createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;
    if (!name || !users) return res.status(400).json({ message: "Vui lòng nhập tên" });
    let parsedUsers = typeof users === "string" ? JSON.parse(users) : users;
    if (parsedUsers.length < 2) return res.status(400).json({ message: "Cần từ 3 người" });
    parsedUsers.push(req.user._id);

    const groupChat = await Conversation.create({ chatName: name, participants: parsedUsers, isGroupChat: true, groupAdmin: req.user._id });
    const fullGroupChat = await Conversation.findById(groupChat._id).populate("participants", "fullName phone email avatar").populate("groupAdmin", "fullName phone email avatar");
    return res.status(200).json(fullGroupChat);
  } catch (error) { res.status(500).json({ message: "Lỗi tạo nhóm" }); }
};

const renameGroup = async (req, res) => {
  try {
    const updatedChat = await Conversation.findByIdAndUpdate(req.body.chatId, { chatName: req.body.chatName }, { new: true })
      .populate("participants", "fullName phone email avatar").populate("groupAdmin", "fullName phone email avatar");
    res.status(200).json(updatedChat);
  } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
};

const updateGroupAvatar = async (req, res) => {
  try {
    const updatedChat = await Conversation.findByIdAndUpdate(req.body.chatId, { groupAvatar: req.body.avatarUrl }, { new: true })
      .populate("participants", "fullName phone email avatar");
    res.status(200).json(updatedChat);
  } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
};

const addGroupMembers = async (req, res) => {
  try {
    const { chatId, userIds } = req.body;
    const ids = Array.isArray(userIds) ? userIds : [req.body.userId].filter(Boolean);
    if (!chatId || !ids.length) {
      return res.status(400).json({ message: "Thiếu thông tin thành viên" });
    }

    const chat = await assertGroupMember(chatId, req.user._id);
    const existingIds = new Set(chat.participants.map((participantId) => String(participantId)));
    const nextIds = ids.filter((userId) => !existingIds.has(String(userId)));

    if (nextIds.length) {
      await Conversation.findByIdAndUpdate(chatId, {
        $addToSet: { participants: { $each: nextIds } },
        $set: { deletedBy: [] },
      });
    }

    const updatedChat = await populateChat(Conversation.findById(chatId));
    return res.status(200).json(updatedChat);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Lỗi server" });
  }
};

const removeGroupMember = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) return res.status(400).json({ message: "Thiếu thành viên cần xóa" });

    const chat = await assertGroupAdmin(chatId, req.user._id);
    if (isSameId(userId, chat.groupAdmin)) {
      return res.status(400).json({ message: "Không thể xóa nhóm trưởng hiện tại" });
    }

    await Conversation.findByIdAndUpdate(chatId, {
      $pull: { participants: userId },
      $addToSet: { deletedBy: userId },
    });

    const updatedChat = await populateChat(Conversation.findById(chatId));
    return res.status(200).json(updatedChat);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Lỗi server" });
  }
};

const promoteGroupAdmin = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) return res.status(400).json({ message: "Thiếu thành viên cần bổ nhiệm" });

    const chat = await assertGroupAdmin(chatId, req.user._id);
    const isTargetMember = chat.participants.some((participantId) => isSameId(participantId, userId));
    if (!isTargetMember) {
      return res.status(400).json({ message: "Người được bổ nhiệm chưa ở trong nhóm" });
    }

    const updatedChat = await populateChat(
      Conversation.findByIdAndUpdate(chatId, { groupAdmin: userId }, { new: true })
    );
    return res.status(200).json(updatedChat);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Lỗi server" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { msgId } = req.params;
    const { type } = req.body; 
    const message = await Message.findById(msgId);
    if (!message) return res.status(404).json({ message: "Không tìm thấy" });

    if (type === 'everyone') {
      if (message.sender.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Không có quyền" });
      message.isUnsent = true;
      message.text = "Tin nhắn đã bị thu hồi";
      message.fileUrl = null; 
      await message.save();
    } else {
      await Message.findByIdAndUpdate(msgId, { $addToSet: { deletedBy: req.user._id } });
    }
    res.status(200).json({ success: true, message });
  } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
};

const deleteConversation = async (req, res) => {
  try {
    await Conversation.findByIdAndUpdate(req.params.chatId, { $addToSet: { deletedBy: req.user._id } });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ message: "Lỗi server" }); }
};

module.exports = {
  accessChat,
  getMessages,
  getChatById,
  getChats,
  createGroupChat,
  renameGroup,
  updateGroupAvatar,
  addGroupMembers,
  removeGroupMember,
  promoteGroupAdmin,
  deleteMessage,
  deleteConversation,
};
