import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true }, // Registration No
  password: { type: String, required: true },
  email: { type: String, default: "-" },
  country: { type: String, default: "-" },
  timezone: { type: String, default: "-" },
  role: { type: String, enum: ['student', 'advisor'], default: 'student' },
  advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for students
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // for advisors
  isActive: { type: Boolean, default: true }, // ✅ Soft delete flag
  createdAt: { type: Date, default: Date.now },
  profilePic: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);

export default User;
