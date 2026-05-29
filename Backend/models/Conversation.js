const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
=======
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String, default: "" },
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String, trim: true, default: "" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupAvatar: { type: String, default: "" },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
>>>>>>> main
  },
  { timestamps: true }
);

<<<<<<< HEAD
module.exports = mongoose.model("Conversation", conversationSchema);
=======
module.exports = mongoose.model("Conversation", conversationSchema);
>>>>>>> main
