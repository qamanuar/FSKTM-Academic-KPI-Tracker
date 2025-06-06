// backend/checkDB.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js"; // adjust if path is different

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB!");

    const users = await User.find();
    console.log("📋 Users in DB:", users);

    process.exit();
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });
