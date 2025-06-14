import mongoose from 'mongoose';

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: String,
  answer: String
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

// Export all models
const FAQ = mongoose.model('FAQ', faqSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

export { FAQ, Feedback };