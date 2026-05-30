const CallHistory = require("../models/CallHistory");

const getCallHistory = async (req, res) => {
  try {
    const history = await CallHistory.find({ participants: req.user._id })
      .populate("caller", "fullName phone email avatar")
      .populate("participants", "fullName phone email avatar")
      .sort({ startedAt: -1 })
      .limit(100);

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Không thể tải lịch sử cuộc gọi" });
  }
};

module.exports = { getCallHistory };
