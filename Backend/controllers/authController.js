const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OtpVerification = require("../models/OtpVerification");
const generateToken = require("../utils/generateToken");
const normalizePhone = require("../utils/normalizePhone");
const {
  sendOtpWithVonage,
  verifyOtpWithVonage,
} = require("../utils/vonage");

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

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  getMe,
};