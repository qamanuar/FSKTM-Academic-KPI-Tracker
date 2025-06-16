import KPI from '../models/kpi.model.js';
import GPA from '../models/gpa.model.js';
import Task from '../models/task.model.js';
import KPIAssignment from '../models/KPI_Assignment.js';
import User from "../models/user.model.js";

export const getStudentKPIs = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const kpis = await KPIAssignment.find({ studentName: user.name });
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadKPIEvidence = async (req, res) => {
  try {
    const documentPath = req.file ? req.file.path : '';
    const { remarks } = req.body;

    const updatedKPI = await KPIAssignment.findByIdAndUpdate(
      req.params.kpiId,
      {
        supportingFile: documentPath,
        assignerComment: remarks,
        submitted: true,
        verificationStatus: 'Not Verified'
      },
      { new: true }
    );

    if (!updatedKPI) {
      return res.status(404).json({ error: "KPI not found" });
    }

    res.json({
      message: 'Evidence uploaded successfully',
      kpi: updatedKPI
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const allTasks = await Task.find({ assignedTo: studentId });
    const pendingTasks = allTasks.filter(t => t.status === 'pending');
    const dueToday = pendingTasks.filter(task =>
      new Date(task.deadline).toDateString() === new Date().toDateString()
    );

    const upcoming = pendingTasks.filter(task => {
      const deadline = new Date(task.deadline);
      const now = new Date();
      return deadline >= now && deadline <= new Date(now.setDate(now.getDate() + 7));
    });

    const gpa = await GPA.findOne({ student: studentId }).sort({ submittedAt: -1 });

    res.json({
      totalTasks: allTasks.length,
      pendingTasks: pendingTasks.length,
      dueToday: dueToday.length,
      upcomingDeadlines: upcoming.map(task => task.title),
      latestGPA: gpa?.value || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
