const User = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query; 
    if (!q) {
      return res.status(200).json([]);
    }

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
    .select("_id fullName phone email avatar")
    .limit(20);

    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi tìm kiếm user:", error);
    return res.status(500).json({ message: "Lỗi server khi tìm kiếm" });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (typeof avatarUrl !== "string" || !avatarUrl.trim()) {
      return res.status(400).json({ message: "Thiếu đường dẫn ảnh đại diện" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl.trim() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({
      id: String(updatedUser._id),
      _id: String(updatedUser._id),
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatar: updatedUser.avatar || "",
      gender: updatedUser.gender || "",
      birthday: updatedUser.birthday || "",
      address: updatedUser.address || "",
      city: updatedUser.city || "",
      country: updatedUser.country || "",
      company: updatedUser.company || "",
      position: updatedUser.position || "",
      department: updatedUser.department || "",
      intro: updatedUser.intro || "",
      skills: Array.isArray(updatedUser.skills) ? updatedUser.skills : [],
      socialLinks: {
        facebook: updatedUser.socialLinks?.facebook || "",
        github: updatedUser.socialLinks?.github || "",
        website: updatedUser.socialLinks?.website || "",
      },
    });
  } catch (error) {
    console.error("Lỗi updateAvatar:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật ảnh đại diện" });
  }
};

const getPublicUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "_id fullName phone email avatar gender birthday address city country company position department intro skills socialLinks"
    );

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server khi lấy hồ sơ" });
  }
};

module.exports = { searchUsers, updateAvatar, getPublicUser };
