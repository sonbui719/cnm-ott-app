const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

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

module.exports = { accessChat, getMessages, getChats, createGroupChat, renameGroup, updateGroupAvatar, deleteMessage, deleteConversation };
