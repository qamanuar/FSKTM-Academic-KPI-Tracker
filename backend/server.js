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
app.use(express.json()); // ← Must have for JSON handling
app.post('/api/feedback', (req, res) => {
  res.json({ success: true }); 
});
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);



// Static frontend serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Serve main frontend HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "General.html"));
});

// MongoDB Connection
mongoose
  .connect(connection)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Replace this line:
const server = http.createServer(app); // 👈 wrap express app in HTTP server
const io = new SocketIOServer(server, {
  cors: { origin: "*" }
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`✅ Registered user: ${userId}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Expose function to emit notifications
export function emitNotification(userId, notification) {
  const socketId = connectedUsers.get(userId);
  console.log(`📣 Attempting to emit notification to user ${userId}, socket: ${socketId}`);

  if (socketId) {
    io.to(socketId).emit("notification", notification);
    console.log("📤 Notification emitted:", notification);
  } else {
    console.warn(`⚠️ No active socket found for user ${userId}`);
  }
}

// Start server using HTTP server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


import studentDashRoutes from './routes/studentDash.routes.js';
app.use('/api/student', studentDashRoutes);

