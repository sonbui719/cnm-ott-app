const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String, default: "" },
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String, trim: true, default: "" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupAvatar: { type: String, default: "" } // Trường lưu link ảnh S3 của nhóm
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);