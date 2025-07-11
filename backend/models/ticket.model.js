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
    ref: 'User' 
  },
  
  } , { timestamps: true});


// Export all models
const FAQ = mongoose.model('FAQ', faqSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

export { FAQ, Feedback };