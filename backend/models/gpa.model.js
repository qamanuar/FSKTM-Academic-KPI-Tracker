import mongoose from 'mongoose';

const gpaSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: String,
  value: Number,
  resultPdf: String, // store file path or URL
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('GPA', gpaSchema);
