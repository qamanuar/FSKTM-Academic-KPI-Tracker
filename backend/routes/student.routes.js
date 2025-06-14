import express from "express";
import multer from "multer";
// import Student from "../models/student.model.js";
import User from '../models/user.model.js'; // This represents both students and advisors
import Task from "../models/task.model.js";
import GPARecord from "../models/gpa.model.js";

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
router.get('/:id', async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      // fallback to matrix ID if not a valid ObjectId
      user = await User.findOne({ id: req.params.id });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Update student profile
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      { id: req.params.id }, // assuming 'id' is registration number
      updates,
      { new: true }
    );
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
