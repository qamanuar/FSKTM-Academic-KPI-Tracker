import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title : { type: String, required: true },
  message: { type: String, required: true },

  // Multiple boolean-based types
  isAlert: { type: Boolean, default: false },
  isAchievement: { type: Boolean, default: false },
  isInfo: { type: Boolean, default: false },

  isRead: { type: Boolean, default: false },

  // Optional: user-defined category/tag for future customization
  tag: { type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);
