import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../server/config/database.js';
import User from '../server/models/User.js';

// Create a mini app for auth routes
const app = express();

// Configure middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'plannora-secret-key', { expiresIn: '30d' });
    
    // Return user data with token
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message || 'Unknown error'
    });
  }
});

// Test route
app.get('/api/auth/test', (req, res) => {
  res.status(200).json({ message: 'Auth API is working' });
});

// Export the serverless handler
export default serverless(app); 