const express = require("express");
const router = express.Router();
const { accessChat, getMessages, getChats, createGroupChat, renameGroup, updateGroupAvatar, deleteMessage, deleteConversation } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, accessChat);
router.get("/", protect, getChats);
router.get("/:chatId/messages", protect, getMessages);
router.post("/group", protect, createGroupChat);
router.put("/group/rename", protect, renameGroup);
router.put("/group/avatar", protect, updateGroupAvatar);

// APIs mới
router.put("/message/:msgId", protect, deleteMessage);
router.delete("/:chatId", protect, deleteConversation);

module.exports = router;