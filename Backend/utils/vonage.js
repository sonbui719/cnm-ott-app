const axios = require("axios");

const getVonageHeaders = () => {
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
        channel: "sms",
        to: phone
      }
    ],
    code_length: 6
  };

  const response = await axios.post(
    "https://api.nexmo.com/v2/verify",
    payload,
    { headers: getVonageHeaders() }
  );

  return response.data;
};

const verifyOtpWithVonage = async (requestId, code) => {
  const response = await axios.post(
    `https://api.nexmo.com/v2/verify/${requestId}`,
    { code },
    { headers: getVonageHeaders() }
  );

  return response.data;
};

module.exports = {
  sendOtpWithVonage,
  verifyOtpWithVonage
};