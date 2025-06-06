import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  note: String,
  progress: Number // e.g. 30 (percent)
});

const kpiSchema = new mongoose.Schema({
  title: String,
  description: String,
  target: Number,
  currentValue: { type: Number, default: 0 },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  document: String, // attachment URL or file path
  updates: [progressSchema]
});

export default mongoose.model('KPI', kpiSchema);
