import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import KPIAssignment from "../models/KPI_Assignment.js";  // note the .js extension
import User from "../models/user.model.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 12,
  },
});

// Show all students and those pending verification
router.get("/", async (req, res) => {
  try {

    console.log("Succesfully fetch data...")
    const students = await KPIAssignment.find();

    const studentsPendingVerification = await KPIAssignment.find({
      status: "Assigned",
      verificationStatus: "Not Verified",
      kpiType: { $ne: "KPI Type" },
      evidenceUrl: { $ne: null },
    });

    res.render("LecturerDashboard", {
      students,
      studentsPendingVerification,
      student: null,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});

router.get('/student/new', (req, res) => {
  res.render('partials/newStudent', {
    student: {
      _id: "", // leave blank so the form action can be replaced
      studentName: "",
      studentYear: "",
      semester: "",
      session: "",
      kpiType: "KPI Type",
      assignerComment: "",
      verificationStatus: "Not Verified",
      evidenceUrl: null
    }
  });
});

// Show a specific student's form
router.get("/student/:id", async (req, res) => {
  try {
    console.log("Succesfully fetch specific data...")
    const { id } = req.params;
    const student = await KPIAssignment.findById(id);
    if (!student) return res.status(404).send("Student not found");

    res.render("partials/editForm", { student });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving student");
  }
});

// Upload supporting file and update student data
router.put("/student/:id/upload", upload.single("supportingFile"), async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      status: "Assigned",
    };

    if (req.file) {
      updateData.supportingFile = "/uploads/" + req.file.filename;
      console.log("File uploaded successfully!");
    }

    await KPIAssignment.findByIdAndUpdate(id, updateData, {
      runValidators: true,
      new: true,
    });

    console.log("Form updated successfully!");
    res.redirect("/lecturer-dashboard");
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Error uploading file");
  }
});

router.post("/student/uploadNew", upload.single("supportingFile"), async (req, res) => {
  try {
    const { student, studentYear, kpiType, semester, session, assignerComment } = req.body;

    const studentUser = await User.findOne({ id: student });
    if (!studentUser) {
      return res.status(404).send("Student user not found");
    }

    const studentData = {
      student: studentUser._id,
      studentName: studentUser.name,
      studentYear, // Or however you determine year
      semester,
      session,
      kpiType,
      assignerComment,
      status: "Assigned",
      verificationStatus: "Not Verified",
      submitted: false,
    };

    if (req.file) {
      studentData.supportingFile = "/uploads/" + req.file.filename;
    }

    const newStudent = new KPIAssignment(studentData);
    await newStudent.save();

    console.log("New KPI assignment created:", newStudent._id);
    res.redirect("/lecturer-dashboard");
  } catch (err) {
    console.error("Error creating new student:", err);
    res.status(500).send("Error creating new student");
  }
});

// Delete student KPI data and file
router.delete("/student/:id", async (req, res) => {
  try {
    console.log("Succesfully delete data...")
    const { id } = req.params;
    const student = await KPIAssignment.findById(id);

    if (student.supportingFile) {
      const filePath = path.join(process.cwd(), student.supportingFile);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
        else console.log("File deleted:", filePath);
      });
    }

    // Reset fields
    student.kpiType = "KPI Type";
    student.status = "Not Assigned";
    student.supportingFile = null;
    student.assignerComment = null;
    student.verificationStatus = "Not Verified";
    student.evidenceUrl = null;
    student.verifierComment = null;
    student.submitted = false;

    await student.save();
    res.redirect("/lecturer-dashboard");
  } catch (error) {
    console.error("Error resetting student:", error);
    res.status(500).send("Error resetting student data");
  }
});


// Submit verification
router.put("/student/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, comment } = req.body;

    const updateData = {
      ...req.body,
      verificationStatus,
      verifierComment: comment,
      submitted: true,
    };

    await KPIAssignment.findByIdAndUpdate(id, updateData, {
      runValidators: true,
      new: true,
    });

    console.log("Verification submitted!");
    res.json({ message: "Verification submitted successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Error submitting verification");
  }
});

export default router;