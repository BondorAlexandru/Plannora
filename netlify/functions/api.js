import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
import authRoutes from '../../server/routes/authRoutes.js';
import eventRoutes from '../../server/routes/eventRoutes.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Export the serverless function
export const handler = serverless(app); 