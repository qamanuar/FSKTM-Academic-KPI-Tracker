import mongoose from 'mongoose';

const mongoose = require('mongoose');

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: String,
  answer: String
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  user: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

// Export all models
const FAQ = mongoose.model('FAQ', faqSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = { FAQ, Feedback };
