import mongoose from 'mongoose';

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: String,
  answer: String
});

// Feedback Schema 
const feedbackSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'] // Email validation
  },
  message: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'  // Links to User model if you have one
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export all models
const FAQ = mongoose.model('FAQ', faqSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

export { FAQ, Feedback };