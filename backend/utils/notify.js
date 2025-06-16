import Notification from "../models/notification.model.js";
import { io } from "../socket.js"; // Or wherever you're exporting your Socket.IO instance

export async function notifyUser({
  userId,
  title,
  message,
  isAlert = false,
  isAchievement = false,
}) {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      isAlert,
      isAchievement,
      createdAt: new Date(),
    });

    await notification.save();

    // 🔌 Emit to user in real-time via socket
    if (io) {
      io.to(userId.toString()).emit("notification", notification);
    }

    return notification;
  } catch (err) {
    console.error("❌ Failed to send notification:", err);
  }
}
