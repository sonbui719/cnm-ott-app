const mongoose = require("mongoose");

<<<<<<< HEAD
=======
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

>>>>>>> main
const connectDB = async () => {
  try {
    console.log("Dang ket noi MongoDB...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Da co URI" : "Chua co URI");

<<<<<<< HEAD
    await mongoose.connect(process.env.MONGO_URI, {
=======
    await mongoose.connect(buildMongoUri(), {
>>>>>>> main
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connect error:", error.message);
    process.exit(1);
  }
};

<<<<<<< HEAD
module.exports = connectDB;
=======
module.exports = connectDB;
>>>>>>> main
