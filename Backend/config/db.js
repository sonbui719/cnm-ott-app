const mongoose = require("mongoose");

const buildMongoUri = () => {
  const uri = process.env.MONGO_URI;
  if (!uri) return uri;

  const directHosts = process.env.MONGO_DIRECT_HOSTS;
  if (!directHosts || !uri.startsWith("mongodb+srv://")) return uri;

  const withoutProtocol = uri.replace("mongodb+srv://", "");
  const slashIndex = withoutProtocol.indexOf("/");
  if (slashIndex === -1) return uri;

  const credentials = withoutProtocol.slice(0, slashIndex).split("@").slice(0, -1).join("@");
  const pathAndQuery = withoutProtocol.slice(slashIndex);
  const params = ["tls=true"];
  if (!pathAndQuery.includes("authSource=")) params.push("authSource=admin");

  const separator = pathAndQuery.includes("?") ? "&" : "?";

  return `mongodb://${credentials}@${directHosts}${pathAndQuery}${separator}${params.join("&")}`;
};

const connectDB = async () => {
  try {
    console.log("Dang ket noi MongoDB...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Da co URI" : "Chua co URI");

    await mongoose.connect(buildMongoUri(), {
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connect error:", error.message);
    console.warn("MongoDB unavailable; starting server in limited mode.");
    return null;
  }
};

module.exports = connectDB;



