const express = require("express");
const router = express.Router();
const { accessChat, getMessages, getChats } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, accessChat);
router.get("/", protect, getChats);
router.get("/:chatId/messages", protect, getMessages);

module.exports = router;