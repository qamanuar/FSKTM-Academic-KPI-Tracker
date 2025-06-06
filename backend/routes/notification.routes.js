// backend/routes/notification.routes.js
import express from "express";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const router = express.Router();

// CREATE new notification (Admin/Advisor)
router.post("/", async (req, res) => {
  try {
    const { recipientId, message, type } = req.body;

    const user = await User.findById(recipientId);
    if (!user) return res.status(404).json({ message: "Recipient not found" });

    const newNotification = new Notification({
      recipient: recipientId,
      message,
      type,
    });
    await newNotification.save();

    res.status(201).json(newNotification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// MARK a notification as read
router.put("/read/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
