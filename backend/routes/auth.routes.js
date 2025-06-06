import express from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// 🔐 Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, id, password } = req.body;

    if (!name || !id || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res.status(400).json({ message: 'ID already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      id,
      password: hashedPassword,
      email: "-",           // default
      country: "-",         // default
      timezone: "-",        // default
      registrationNo: "-"   // default
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔓 Login
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ message: 'ID and password are required' });
    }

    const user = await User.findOne({ id });
    if (!user) {
      return res.status(400).json({ message: 'Invalid ID or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid ID or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        id: user.id,
        email: user.email,
        country: user.country,
        timezone: user.timezone,
        registrationNo: user.registrationNo
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✏️ Update profile (name, email, country, timezone, registrationNo)
router.put('/update/:id', async (req, res) => {
  try {
    const { name, email, country, timezone, registrationNo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, country, timezone, registrationNo },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 Change password
router.put('/password/:id', async (req, res) => {
  try {
    const { current, newPass } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const hashed = await bcrypt.hash(newPass, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
