import express from "express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { deleteAllNotificationsForUser } from '../controllers/notification.controller.js';
import { emitNotification } from '../server.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Create a new notification
router.post("/", async (req, res) => {
  try {
    const { userId, title, message, isAlert, isAchievement, isInfo, tag } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newNotification = new Notification({
      user: user._id,
      title,
      message,
      isAlert: !!isAlert,
      isAchievement: !!isAchievement,
      isInfo: !!isInfo,
      tag: tag || null,
    });

    await newNotification.save();

    // 🔔 Emit real-time push
    emitNotification(user._id.toString(), {
      _id: newNotification._id,
      title,
      message,
      isAlert,
      isAchievement,
      isInfo,
      tag,
      createdAt: newNotification.createdAt // ✅ use saved timestamp
    });


    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4B0082;">📬 ${title || 'New Notification'}</h2>

            <p>Hello ${user.name || 'User'},</p>

            <p>You have received a new notification in the <strong>FSKTM KPI Tracker</strong> system:</p>

            <div style="background: #eee; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong style="font-size: 1.1em;">${title}</strong>
              <p style="margin: 10px 0 0;">${message}</p>
            </div>

            <p>You can log in to your dashboard to view more details.</p>

            <a href="https://yourdomain.com/dashboard" style="display:inline-block;background:#4B0082;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;margin-top:10px;">
              View Dashboard
            </a>

            <p style="font-size: 0.9em; color: #888; margin-top: 30px;">– FSKTM KPI Tracker System</p>
          </div>
        </body>
      </html>
    `;

    // 📧 Send email
    await sendEmail(
      user.email,
      "📬 New Notification",
      html
    );

    res.status(201).json({ message: "Notification created", notification: newNotification });

  } catch (error) {
    console.error("❌ Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
router.put("/mark-read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.isRead = true;
    await notification.save();
    res.json({ message: "Marked as read", notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete notification
router.delete("/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const deleted = await Notification.findByIdAndDelete(notificationId);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete('/delete-all/:userId', deleteAllNotificationsForUser);

export default router;
