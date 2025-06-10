const express = require('express');
const router = express.Router();
const { FAQ, Feedback } = require('../models/ticket.model');

// ─── FAQ ROUTES ─────────────────────────────────────

// View all FAQs
router.get('/faqs', async (req, res) => {
  const faqs = await FAQ.find();
  res.json(faqs);
});

// Add new FAQ
router.post('/faqs', async (req, res) => {
  const { question, answer } = req.body;
  const faq = new FAQ({ question, answer });
  await faq.save();
  res.status(201).json(faq);
});

// Update FAQ
router.put('/faqs/:id', async (req, res) => {
  const updated = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete FAQ
router.delete('/faqs/:id', async (req, res) => {
  await FAQ.findByIdAndDelete(req.params.id);
  res.json({ message: 'FAQ deleted' });
});


// ─── FEEDBACK ROUTES ─────────────────────────────────────

// Submit feedback
router.post('/feedback', async (req, res) => {
  const feedback = new Feedback(req.body);
  await feedback.save();
  res.status(201).json(feedback);
});

// View all feedback
router.get('/feedback', async (req, res) => {
  const feedbacks = await Feedback.find();
  res.json(feedbacks);
});

// View specific feedback
router.get('/feedback/:id', async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  res.json(feedback);
});

// Edit feedback
router.put('/feedback/:id', async (req, res) => {
  const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete feedback
router.delete('/feedback/:id', async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ message: 'Feedback deleted' });
});

module.exports = router;
