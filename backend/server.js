import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from './routes/student.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import ticketRoutes from './routes/ticket.routes.js';


dotenv.config();

const app = express(); // ✅ Moved to the top after imports
const PORT = process.env.PORT || 3000;
const connection = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/notifications", notificationRoutes);
app.use("/api/tickets", ticketRoutes);

// Static frontend serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Serve main frontend HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "General.html"));
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

// MongoDB Connection
mongoose
  .connect(connection)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
