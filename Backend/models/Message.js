const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
=======
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" }, 
    status: { type: String, enum: ["sent", "seen"], default: "sent" },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    isUnsent: { type: Boolean, default: false }, // Đánh dấu thu hồi
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Đánh dấu xóa phía user
>>>>>>> main
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);