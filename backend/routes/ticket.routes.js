import express from 'express';
const router = express.Router(); 
import { FAQ, Feedback } from '../models/ticket.model.js';

// Insert predefined FAQs only once
const predefinedFaqs = [
  { 
    question: "How do I reset my password?", 
    answer: "Click on 'Forgot Password' at login and follow the instructions." 
  },
  { 
    question: "Where can I view my ticket history?", 
    answer: "Go to your profile and click on 'My Tickets'." 
  },
  { 
    question: "How long does it take to receive feedback?", 
    answer: "Usually within 24-48 hours." 
  },
  { 
    question: "How feedback works?", 
    answer: "When you submit your feedback, our team will review it and get back to you via the email you provided." 
  }
];

const insertPredefinedFaqs = async () => {
  const count = await FAQ.countDocuments();
  if (count === 0) {
    await FAQ.insertMany(predefinedFaqs);
    console.log("Predefined FAQs inserted.");
  }
};
insertPredefinedFaqs();


// FAQ
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: "Failed to load FAQs" });
  }
});

// FEEDBACK
router.post('/feedback', async (req, res) => {
  try {
    const { email, message, userId} = req.body;

    console.log("📥 POST /feedback body:", req.body);

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    const feedback = new Feedback({
      email,
      message,
      userId
    });

    await feedback.save(); 
    res.status(201).json(feedback);

  } catch (error) {
    console.error("❌ Error in POST /feedback:", error);
    res.status(500).json({ 
      error: "Failed to submit feedback",
      details: error.message 
    });
  }
});

// GET /api/tickets/feedback 
router.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); 
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

router.get('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

//delete
router.delete('/feedback/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    
    // Verify ownership
    if (feedback.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this feedback" });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      error: "Failed to delete feedback",
      details: error.message 
    });
  }
});

router.put('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, message, userId } = req.body;

    console.log("PUT Request for feedback ID:", id, "by user:", userId);

    if (!userId) return res.status(400).json({ error: "User ID required" });

    const updated = await Feedback.findOneAndUpdate(
      { _id: id, userId }, 
      { email, message },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Feedback not found or unauthorized" });
    res.json(updated);
  } catch (error) {
    console.error("PUT /feedback/:id error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;