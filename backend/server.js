import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js'
import cors from 'cors';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const connection = process.env.MONGO_URI;
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

mongoose.connect(connection).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// use the auth route
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});