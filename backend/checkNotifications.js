import mongoose from "mongoose";
import dotenv from "dotenv";
import Notification from "./models/notification.model.js"; // Adjust path if needed
import User from "./models/user.model.js"; // Optional: if you want to populate

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB!");

    // Fetch and populate user details for better clarity
    const notifications = await Notification.find().populate("user", "name id email");

    console.log(`📬 Found ${notifications.length} notifications:\n`);
    notifications.forEach((n, i) => {
      console.log(`${i + 1}. ${n.message}`);
      console.log(`   ↪️  To: ${n.user?.name || "Unknown"} (${n.user?.id})`);
      console.log(`   🏷️  Tags: alert=${n.isAlert}, achievement=${n.isAchievement}, info=${n.isInfo}`);
      console.log(`   📅 Created: ${n.createdAt}`);
      console.log(`   ✅ Read: ${n.isRead}\n`);
    });

    process.exit();
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });
