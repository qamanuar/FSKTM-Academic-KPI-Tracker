const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket.model');

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    const ticket = new Ticket({ title, description });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
