require('dotenv').config();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OtpVerification = require("../models/OtpVerification");
const generateToken = require("../utils/generateToken");
const normalizePhone = require("../utils/normalizePhone");
const {
  sendOtpWithVonage,
  verifyOtpWithVonage,
} = require("../utils/vonage");
const { Vonage } = require('@vonage/server-sdk');

// Khởi tạo Vonage để dùng cho các hàm custom
const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,   
    apiSecret: process.env.VONAGE_API_SECRET 
});

// Hàm format dữ liệu user trả về cho client
const toSafeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  gender: user.gender || "",
  birthday: user.birthday || "",
  address: user.address || "",
  city: user.city || "",
  country: user.country || "",
  company: user.company || "",
  position: user.position || "",
  department: user.department || "",
  intro: user.intro || "",
  skills: Array.isArray(user.skills) ? user.skills : [],
  socialLinks: {
    facebook: user.socialLinks?.facebook || "",
    github: user.socialLinks?.github || "",
    website: user.socialLinks?.website || "",
  },
});

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Vui lòng nhập số điện thoại",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    await OtpVerification.updateMany(
      { phone: normalizedPhone, status: "pending" },
      { status: "expired" }
    );

    const result = await sendOtpWithVonage(normalizedPhone);

    await OtpVerification.create({
      phone: normalizedPhone,
      requestId: result.request_id,
      status: "pending",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return res.status(200).json({
      message: "Gửi OTP thành công",
      phone: normalizedPhone,
      requestId: result.request_id,
    });
  } catch (error) {
    console.error("sendOtp error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Gửi OTP thất bại",
      error: error.response?.data || error.message,
    });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        message: "Thiếu phone hoặc code",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    const otpRecord = await OtpVerification.findOne({
      phone: normalizedPhone,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({
        message: "Không tìm thấy OTP còn hiệu lực",
      });
    }

    const verifyResult = await verifyOtpWithVonage(otpRecord.requestId, code);

    if (verifyResult.status === "completed") {
      otpRecord.status = "verified";
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();

      await User.updateOne({ phone: normalizedPhone }, { isPhoneVerified: true });

      return res.status(200).json({
        message: "Xác minh OTP thành công",
        phone: normalizedPhone,
      });
    }

    otpRecord.status = "failed";
    await otpRecord.save();

    return res.status(400).json({
      message: "OTP không đúng",
      data: verifyResult,
    });
  } catch (error) {
    console.error("verifyOtp error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Xác minh OTP thất bại",
      error: error.response?.data || error.message,
    });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      gender,
      birthday,
      address,
      city,
      country,
      company,
      position,
      department,
      intro,
      skills,
      socialLinks,
    } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      return res.status(400).json({
        message: "Số điện thoại đã tồn tại",
      });
    }

    const verifiedOtp = await OtpVerification.findOne({
      phone: normalizedPhone,
      status: "verified",
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!verifiedOtp) {
      return res.status(400).json({
        message: "Số điện thoại chưa xác minh OTP",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      isPhoneVerified: true,
      gender: gender || "",
      birthday: birthday || "",
      address: address || "",
      city: city || "",
      country: country || "",
      company: company || "",
      position: position || "",
      department: department || "",
      intro: intro || "",
      skills: Array.isArray(skills)
        ? skills.filter(Boolean).map((item) => String(item).trim())
        : [],
      socialLinks: {
        facebook: socialLinks?.facebook || "",
        github: socialLinks?.github || "",
        website: socialLinks?.website || "",
      },
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: toSafeUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    console.error("register error:", error.message);

    return res.status(500).json({
      message: "Đăng ký thất bại",
      error: error.message,
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.email || req.body.phone;
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email/số điện thoại và mật khẩu",
      });
    }

    const normalizedIdentifier = String(identifier).trim();
    const query = normalizedIdentifier.includes("@")
      ? { email: normalizedIdentifier.toLowerCase() }
      : { phone: normalizePhone(normalizedIdentifier) };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        message: "Tài khoản không tồn tại",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Sai mật khẩu",
      });
    }

    if (!user.isPhoneVerified) {
      return res.status(403).json({
        message: "Tài khoản chưa xác minh số điện thoại",
      });
    }

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: toSafeUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    console.error("login error:", error.message);

    return res.status(500).json({
      message: "Đăng nhập thất bại",
      error: error.message,
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return res.status(200).json({
    user: toSafeUser(req.user),
  });
};

// --- PHẦN MỚI: QUÊN MẬT KHẨU ---

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    // 1. Chuẩn hóa số điện thoại
    const normalizedPhone = normalizePhone(phoneNumber);

    // 2. Kiểm tra xem số điện thoại có trong DB không
    const user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Số điện thoại này chưa được đăng ký tài khoản!",
      });
    }

    // 3. Gửi OTP qua Vonage
    vonage.verify.start({
      number: normalizedPhone,
      brand: "OTT_APP_KIEN"
    }, async (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Lỗi kết nối dịch vụ SMS",
          error: err
        });
      }

      if (result.status === '0') {
        // Lưu vết vào bảng OtpVerification để đồng bộ với logic hiện tại
        await OtpVerification.create({
          phone: normalizedPhone,
          requestId: result.request_id,
          status: "pending",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        res.status(200).json({
          success: true,
          message: "Mã OTP đã được gửi thành công",
          requestId: result.request_id
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error_text
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi kiểm tra số điện thoại",
      error: error.message
    });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { phoneNumber, newPassword } = req.body;
  try {
    const normalizedPhone = normalizePhone(phoneNumber);

    // Tạo mã salt và hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật vào DB
    const updatedUser = await User.findOneAndUpdate(
      { phone: normalizedPhone },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng để cập nhật mật khẩu"
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật mật khẩu thành công!"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật mật khẩu mới",
      error: error.message
    });
  }
};

// Xuất tất cả các hàm bằng module.exports (Đồng bộ CommonJS)
module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};