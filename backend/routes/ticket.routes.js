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


// ─── FAQ ROUTES ─────────────────────────────────────
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: "Failed to load FAQs" });
  }
});

// ─── FEEDBACK ROUTES ─────────────────────────────────────
router.post('/feedback', async (req, res) => { // ← Added async here
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

    await feedback.save(); // ← Now properly awaited
    res.status(201).json(feedback);

  } catch (error) {
    console.error("❌ Error in POST /feedback:", error);
    res.status(500).json({ 
      error: "Failed to submit feedback",
      details: error.message 
    });
  }
});

// GET /api/tickets/feedback (Add this route)
router.get('/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // Newest first
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

// PUT /api/tickets/feedback/:id - Update feedback
router.put('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, message, userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find and verify ownership before updating
    const feedback = await Feedback.findOne({
      _id: id,
      userId: userId
    });

    if (!feedback) {
      return res.status(404).json({ 
        error: "Feedback not found or unauthorized" 
      });
    }

    // Update the feedback
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { email, message },
      { new: true } // Return the updated document
    );

    res.json(updatedFeedback);

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      error: "Failed to update feedback",
      details: error.message 
    });
  }
});

export default router;