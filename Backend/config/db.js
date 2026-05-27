const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Dang ket noi MongoDB...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Da co URI" : "Chua co URI");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connect error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;