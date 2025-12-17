const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);

  console.log("✅ MongoDB connected:", mongoose.connection.name);
}

module.exports = connectDB;
