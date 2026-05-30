const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/chatController");
const { getCallHistory } = require("../controllers/callController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, accessChat);
router.get("/", protect, getChats);
router.get("/:chatId/messages", protect, getMessages);
router.post("/group", protect, createGroupChat);
router.put("/group/rename", protect, renameGroup);
router.put("/group/avatar", protect, updateGroupAvatar);
router.put("/group/members/add", protect, addGroupMembers);
router.put("/group/members/remove", protect, removeGroupMember);
router.put("/group/admin", protect, promoteGroupAdmin);
router.get("/calls/history", protect, getCallHistory);
router.get("/:chatId", protect, getChatById);

// APIs mới
router.put("/message/:msgId", protect, deleteMessage);
router.delete("/:chatId", protect, deleteConversation);

module.exports = router;
