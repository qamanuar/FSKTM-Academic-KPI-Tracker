import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import KPIAssignment from "../models/KPI_Assignment.js";
import User from "../models/user.model.js";
// import { notifyUser } from "../utils/notify.js";

const router = express.Router();

// Multer config for uploading file
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

// Show all students and the pending verifications
router.get("/", async (req, res) => {
  try {
    console.log("Succesfully fetch data...");
    const advisorId = req.query.advisorId;
    if (!advisorId) return res.status(403).send("Advisor ID missing");
    const students = await KPIAssignment.find({
      advisor: advisorId,
    });

    const studentsPendingVerification = await KPIAssignment.find({
      advisor: advisorId,
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

// render the form for new student entry
router.get("/student/uploadNew", async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true });

    res.render("partials/newStudent", {
      students,
      student: {
        _id: "",
        studentName: "",
        studentYear: "",
        semester: "",
        session: "",
        kpiType: "KPI Type",
        assignerComment: "",
        verificationStatus: "Not Verified",
        evidenceUrl: null,
      },
    });
  } catch (err) {
    console.error("Error loading new student form:", err);
    res.status(500).send("Error loading form");
  }
});

// render the form for editting pre-existing student entry
router.get("/student/:id", async (req, res) => {
  try {
    console.log("Succesfully fetch specific data...");
    const { id } = req.params;
    const student = await KPIAssignment.findById(id).populate("student");
    if (!student) return res.status(404).send("Student not found");

    res.render("partials/editForm", { student });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving student");
  }
});

// GET /lecturer-dashboard/students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      isActive: true,
    }).select("_id id name");
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload supporting file and update student data
router.put(
  "/student/:id/upload",
  upload.single("supportingFile"),
  async (req, res) => {
    
    try {
      const advisorId = req.body.advisor;
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
      }).populate("student");

      // Send notification for KPI assigned
      // if (updatedKPI && updatedKPI.student) {
      //   await notifyUser({
      //     userId: updatedKPI.student._id,
      //     title: "New KPI Assigned",
      //     message: "A new KPI has been assigned to you. Please check your dashboard.",
      //     isAlert: true,
      //   });
      // }

      console.log("Form updated successfully!");
      res.redirect(`/lecturer-dashboard?advisorId=${advisorId}`);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).send("Error uploading file");
    }
  }
);

// create new student kpi
router.post(
  "/student/uploadNew",
  upload.single("supportingFile"),
  async (req, res) => {
    try {
      const { student } = req.body;
      const advisorId = req.body.advisor;

      if (!student || student === "") {
        return res.status(400).send("Student is required.");
      }

      const selectedStudent = await User.findById(student);
      if (!selectedStudent) {
        return res.status(404).send("Student not found.");
      }

      const studentData = {
        ...req.body,
        student: selectedStudent._id,
        studentName: selectedStudent.name,
        advisor: advisorId,
        verificationStatus: "Not Verified",
        status: "Assigned",
        submitted: false,
      };

      if (req.file) {
        studentData.supportingFile = "/uploads/" + req.file.filename;
      }

      const newStudent = new KPIAssignment(studentData);
      await newStudent.save();

      // Send notification for KPI assigned
      // await notifyUser({
      //   userId: selectedStudent._id,
      //   title: "New KPI Assigned",
      //   message: "A new KPI has been assigned to you. Please check your dashboard.",
      //   isAlert: true,
      // });

      console.log("New student created:", newStudent._id);

      res.redirect(`/lecturer-dashboard?advisorId=${advisorId}`);
    } catch (err) {
      console.error("Full error creating new student:", err.stack || err);
      res.status(500).send("Error creating new student");
    }
  }
);

// Reset student KPI data and file
router.delete("/student/:id", async (req, res) => {
  try {
    const advisorId = req.query.advisor;
    const { id } = req.params;
    const student = await KPIAssignment.findById(id).populate("student");

    if (student.supportingFile) {
      const filePath = path.join(process.cwd(), student.supportingFile);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
        else console.log("File deleted:", filePath);
      });
    }
    // Reset fields
    student.kpiType = "KPI Type"; student.status = "Not Assigned";
    student.supportingFile = null; student.assignerComment = null;
    student.verificationStatus = "Not Verified";
    student.evidenceUrl = null;  student.verifierComment = null; student.submitted = false;

    await student.save();
    res.redirect(`/lecturer-dashboard?advisorId=${advisorId}`);
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
      ...req.body,verificationStatus, verifierComment: comment,submitted: true,
    };

    await KPIAssignment.findByIdAndUpdate(id, updateData, {
      runValidators: true,
      new: true,
    });

        // Send notification depending on verification status
  //   if (updatedKPI) {
  //     const userId = updatedKPI.student.toString(); // or the user ID to notify

  //     if (verificationStatus === "Rejected") {
  //       await notifyUser({
  //         userId,
  //         title: "KPI Verification Rejected",
  //         message: "Your KPI verification was rejected. Please review the comments.",
  //         isAlert: true,
  //       });
  //     } else if (verificationStatus === "Passed") {
  //       await notifyUser({
  //         userId,
  //         title: "KPI Verification Approved",
  //         message: "Congratulations! Your KPI verification has been approved.",
  //         isAchievement: true,
  //       });
  //   }
  // }


    console.log("Verification submitted!");
    res.json({ message: "Verification submitted successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Error submitting verification");
  }
});


export default router;
