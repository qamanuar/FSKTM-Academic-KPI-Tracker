import express from "express";
import multer from "multer";
// import Student from "../models/student.model.js";
import User from '../models/user.model.js'; // This represents both students and advisors
import Task from "../models/task.model.js";
import GPARecord from "../models/gpa.model.js";
import mongoose from "mongoose";

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

/**
 * GET student profile
 */
// GET /api/students/:id
// GET /api/students/:id
router.get("/:id", async (req, res) => {
  try {
    let user;

    // If the provided ID is a valid MongoDB ObjectId, try finding by _id
    if (mongoose.isValidObjectId(req.params.id)) {
      user = await User.findById(req.params.id);
    }

    // If not found, or it's not a valid ObjectId, fall back to registration number (id)
    if (!user) {
      user = await User.findOne({ id: req.params.id });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Update student profile
router.put("/:id", async (req, res) => {
  try {
    let user;

    // If the ID is a valid MongoDB ObjectId
    if (mongoose.isValidObjectId(req.params.id)) {
      user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }

    // If not found, or ID is not an ObjectId, fall back to registration number (id)
    if (!user) {
      user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



/**
 * POST GPA record (with PDF upload)
 */
router.post("/:id/gpa", upload.single("gpaProof"), async (req, res) => {
  try {
    const gpaRecord = new GPARecord({
      studentId: req.params.id,
      gpa: req.body.gpa,
      semester: req.body.semester,
      proofFile: req.file?.filename || null,
    });
    await gpaRecord.save();
    res.status(201).json({ message: "GPA submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST submit task with proof file
 */
router.post("/:id/tasks/:taskId/submit", upload.single("proofFile"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.submissions.push({
      studentId: req.params.id,
      proofFile: req.file?.filename || null,
      submittedAt: new Date(),
    });

    await task.save();
    res.status(200).json({ message: "Task submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT update KPI progress
 */
router.put("/:id/kpi/:kpiId", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const kpi = student.kpis.id(req.params.kpiId);
    if (!kpi) return res.status(404).json({ message: "KPI not found" });

    Object.assign(kpi, req.body); // merge updates
    await student.save();

    res.json({ message: "KPI updated", kpi });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
