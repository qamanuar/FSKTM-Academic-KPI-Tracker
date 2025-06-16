
import express from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import sendEmail from '../models/sendEmail.js';
import crypto from 'crypto';

const router = express.Router();


    // Email verification route
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Verifying token:", token); // Debug log

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send('Invalid or expired verification link.');
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.send('Email verified successfully! You can now log in.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error.');
  }
});

// Register new user
router.post('/register', async (req, res) => {
  console.log("Register payload:", req.body);

  try {
    const { name, id, email, password, country, timezone, role } = req.body;

    if (!name || !id || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res.status(400).json({ message: 'ID already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      name,
      id,
      email,
      password: hashedPassword,
      role,
      country: country || "-",
      timezone: timezone || "-",
      registrationNo: "-",
      verificationToken 
    });

    await newUser.save();

    // Send verification email
    const verifyLink = `http://localhost:3000/api/auth/verify/${verificationToken}`;
    const subject = 'Verify your email for FSKTM KPI Tracker';
    const html = `<p>Hello ${name},</p>
                  <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                  <a href="${verifyLink}">${verifyLink}</a>`;

    await sendEmail(email, subject, html);

    res.status(201).json({ message: 'User registered successfully and verification email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
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

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid ID or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
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
        registrationNo: user.registrationNo,
        role: user.role // Include role for dashboard redirection
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate account
router.put('/deactivate/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Recover account
router.put('/recover/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { isActive: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account recovered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/update/:id', async (req, res) => {
  try {
    const { name, email, country, timezone, registrationNo } = req.body;

    let updatedUser = await User.findById(req.params.id);
    if (updatedUser) {
      updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, country, timezone, registrationNo },
        { new: true }
      );
    } else {
      updatedUser = await User.findOneAndUpdate(
        { id: req.params.id },
        { name, email, country, timezone, registrationNo },
        { new: true }
      );
    }

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated', user: updatedUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
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
