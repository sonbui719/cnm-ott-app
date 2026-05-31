require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

function buildMongoUri() {
  const uri = process.env.MONGO_URI;
  const directHosts = process.env.MONGO_DIRECT_HOSTS;
  if (!uri || !directHosts || !uri.startsWith("mongodb+srv://")) return uri;

  const withoutProtocol = uri.replace("mongodb+srv://", "");
  const slashIndex = withoutProtocol.indexOf("/");
  const credentials = withoutProtocol.slice(0, slashIndex).split("@").slice(0, -1).join("@");
  const pathAndQuery = withoutProtocol.slice(slashIndex);
  const separator = pathAndQuery.includes("?") ? "&" : "?";
  return `mongodb://${credentials}@${directHosts}${pathAndQuery}${separator}tls=true&authSource=admin`;
}

async function main() {
  await mongoose.connect(buildMongoUri(), { serverSelectionTimeoutMS: 15000 });
  const password = await bcrypt.hash("123456", 10);
  const user = await User.findOneAndUpdate(
    { email: "admin@startup.com" },
    {
      fullName: "Admin Demo",
      email: "admin@startup.com",
      phone: "0900000000",
      password,
      role: "admin",
      isPhoneVerified: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Demo user ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
