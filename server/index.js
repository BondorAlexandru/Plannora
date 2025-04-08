import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

// Load environment variables
dotenv.config();

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// Define port
const PORT = process.env.PORT || 5001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alex:Bicrlafs1997@plannora.wac0bxz.mongodb.net/?retryWrites=true&w=majority&appName=Plannora';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// User model
const User = mongoose.model('User', userSchema);

// Define Event Schema
const eventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  eventType: {
    type: String,
    enum: ['wedding', 'birthday', 'corporate', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Event model
const Event = mongoose.model('Event', eventSchema);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://plannora.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; 