// routes/ticket.routes.js
import express from 'express';
import { FAQ, Feedback } from '../models/ticket.model.js';

// Insert predefined FAQs only once
const predefinedFaqs = [
  { question: "How do I reset my password?", answer: "Click on 'Forgot Password' at login and follow the instructions." },
  { question: "Where can I view my ticket history?", answer: "Go to your profile and click on 'My Tickets'." },
  { question: "How long does it take to receive feedback?", answer: "Usually within 24-48 hours." }
];

const insertPredefinedFaqs = async () => {
  const count = await FAQ.countDocuments();
  if (count === 0) {
    await FAQ.insertMany(predefinedFaqs);
    console.log("Predefined FAQs inserted.");
  }
};
insertPredefinedFaqs();

// ─── FAQ ROUTES ─────────────────────────────────────
router.get('/faqs', async (req, res) => {
  const faqs = await FAQ.find();
  res.json(faqs);
});

// ─── FEEDBACK ROUTES ─────────────────────────────────────
router.post('/feedback', async (req, res) => {
  const feedback = new Feedback(req.body);
  await feedback.save();
  res.status(201).json(feedback);
});

router.get('/feedback', async (req, res) => {
  const feedbacks = await Feedback.find();
  res.json(feedbacks);
});

router.get('/feedback/:id', async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  res.json(feedback);
});

router.put('/feedback/:id', async (req, res) => {
  const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/feedback/:id', async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ message: 'Feedback deleted' });
});

export default router;
