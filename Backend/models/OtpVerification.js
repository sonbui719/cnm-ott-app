const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true
    },
    requestId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "verified", "failed", "expired"],
      default: "pending"
    },
    expiresAt: {
      type: Date,
      required: true
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);