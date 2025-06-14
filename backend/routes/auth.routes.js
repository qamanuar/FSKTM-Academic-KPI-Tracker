import express from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

const router = express.Router();
// 🔐 Register new user
router.post('/register', async (req, res) => {
console.log("Register payload:", req.body);
  try {
    const { name, id, password, email, country, timezone } = req.body;

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
      email,  
      password: hashedPassword,
      country: country || "-",         // default
      timezone: timezone || "-",        // default
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

    if(!user.isActive){
      return res.status(403).json({message:'Account is deactivated',deactivated:true});
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

// Soft delete (deactivate account)
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

// 🔁 Recover account
router.put('/recover/:id', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { isActive: true }, // Reactivate the user
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account recovered successfully' });
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

    const user = await User.findById(req.params._id);
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

// Upload profile picture
router.put('/profile-pic/:id', async (req, res) => {
  try {
    const { profilePic } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile picture updated', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;