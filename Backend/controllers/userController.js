const User = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query; 
    if (!q) {
      return res.status(200).json([]);
    }

    // Tự động thêm 84 nếu người dùng tìm kiếm bắt đầu bằng 0
    let phoneSearchQuery = q;
    if (q.startsWith("0")) {
      phoneSearchQuery = "84" + q.slice(1);
    }

    const users = await User.find({
      $or: [
        { fullName: { $regex: q, $options: "i" } },
        { phone: { $regex: phoneSearchQuery, $options: "i" } }
      ]
    })
    .select("_id fullName phone email")
    .limit(20);

    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi tìm kiếm user:", error);
    return res.status(500).json({ message: "Lỗi server khi tìm kiếm" });
  }
};

module.exports = { searchUsers };