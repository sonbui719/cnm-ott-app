const normalizePhone = (phone) => {
  if (!phone) return "";

  let cleaned = String(phone).replace(/\D/g, "");

  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.startsWith("0")) {
    cleaned = "84" + cleaned.slice(1);
  }

  return cleaned;
};

module.exports = normalizePhone;