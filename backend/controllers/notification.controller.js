import Notification from '../models/notification.model.js';

export const deleteAllNotificationsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await Notification.deleteMany({ user: userId });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} notifications.`,
    });
  } catch (err) {
    console.error("Error deleting all notifications:", err);
    res.status(500).json({ message: "Server error. Could not delete notifications." });
  }
};
