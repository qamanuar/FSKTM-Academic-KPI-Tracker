import mongoose from 'mongoose';

const KPIAssignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advisor: {
    type: String,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentYear: {
    type: String,
    required: true
  },
  kpiType: { 
    type: String, 
    enum: ['GPA', 'Attendance Percentage', 'Event Engagement', 'KPI Type'],
    default: 'KPI Type'
  },
  semester: {
    type: String,
    required: true
  },
  session: {
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['Assigned', 'Not Assigned'],
    default: 'Not Assigned'
  },
  supportingFile: {
    type: String,
    default: null
  },
  assignerComment: {
    type: String,
    default: null
  },
  verificationStatus: { 
    type: String, 
    enum: ['Not Verified', 'Passed', 'Rejected'],
    default: 'Not Verified'
  },
  evidenceUrl: {
    type: String,
    default: null
  },
  verifierComment: {
    type: String,
    default: null
  },
  submitted: {
    type: Boolean,
    default: false
  }
});

const KPIAssignment = mongoose.model('KPIAssignment', KPIAssignmentSchema, "LecturersDashboard");
export default KPIAssignment;