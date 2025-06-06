import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: Date,
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // advisor
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // student
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
