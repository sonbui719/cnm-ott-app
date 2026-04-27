const axios = require("axios");

const getVonageHeaders = () => {
  // Kiểm tra xem Key/Secret đã load từ .env chưa
  if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
    console.error("LỖI: Chưa cấu hình VONAGE_API_KEY hoặc VONAGE_API_SECRET trong file .env");
  }

  const credentials = Buffer.from(
    `${process.env.VONAGE_API_KEY}:${process.env.VONAGE_API_SECRET}`
  ).toString("base64");

  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
};

const sendOtpWithVonage = async (phone) => {
  const payload = {
    brand: process.env.VONAGE_BRAND_NAME || "OTTAPP",
    workflow: [
      {
        channel: "voice",
        to: phone
      }
    ],
    code_length: 6
  };

  try {
    console.log("=> Đang gọi Vonage API V2 gửi tới:", phone);
    
    const response = await axios.post(
      "https://api.nexmo.com/v2/verify",
      payload,
      { headers: getVonageHeaders() }
    );

    console.log("=> Kết quả Vonage V2:", response.data);
    return response.data;

  } catch (error) {
    // Đây là phần quan trọng nhất để biết tại sao không nhận được OTP
    if (error.response) {
      console.error("=> LỖI TỪ VONAGE API:", {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error("=> LỖI KẾT NỐI:", error.message);
    }
    throw error;
  }
};

const verifyOtpWithVonage = async (requestId, code) => {
  try {
    const response = await axios.post(
      `https://api.nexmo.com/v2/verify/${requestId}`,
      { code },
      { headers: getVonageHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("=> LỖI XÁC THỰC OTP:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  sendOtpWithVonage,
  verifyOtpWithVonage
};