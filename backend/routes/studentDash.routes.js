import express from 'express';
import {
  getStudentKPIs,
  uploadKPIEvidence,
  getDashboardSummary
} from '../controllers/studentDash.controller.js';
import multer from 'multer';

const router = express.Router();

// Setup file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
router.get('/:studentId/kpis', getStudentKPIs);
router.post('/:studentId/kpis/:kpiId/upload', upload.single('document'), uploadKPIEvidence);
router.get('/:studentId/summary', getDashboardSummary);

export default router;
