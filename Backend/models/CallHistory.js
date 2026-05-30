const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema(
  {
    callId: { type: String, required: true, unique: true, index: true },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    answeredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    missedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    unavailableBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    callType: { type: String, enum: ["audio", "video"], default: "audio" },
    isGroupCall: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["ringing", "answered", "ended", "rejected", "missed", "unavailable", "canceled"],
      default: "ringing",
    },
    startedAt: { type: Date, default: Date.now },
    answeredAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallHistory", callHistorySchema);
