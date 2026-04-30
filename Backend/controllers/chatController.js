const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Thiếu userId của người nhận" });
  }

  try {
    let chat = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate("participants", "fullName phone email");

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = await Conversation.create({
      participants: [req.user._id, userId],
    });

    const fullChat = await Conversation.findById(newChat._id).populate(
      "participants",
      "fullName phone email"
    );

    return res.status(200).json(fullChat);
  } catch (error) {
    console.error("Lỗi accessChat:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.chatId })
      .populate("sender", "fullName avatar")
      .sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Lỗi getMessages:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getChats = async (req, res) => {
  try {
    const chats = await Conversation.find({
      participants: { $elemMatch: { $eq: req.user._id } }
    })
    .populate("participants", "fullName phone email")
    .sort({ updatedAt: -1 }); 
    
    res.status(200).json(chats);
  } catch (error) {
    console.error("Lỗi getChats:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { accessChat, getMessages, getChats };