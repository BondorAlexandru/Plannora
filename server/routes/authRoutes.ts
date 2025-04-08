import express from 'express';
import { register, login, logout, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import User, { IUser } from '../models/User.js';
import mongoose from 'mongoose';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Special debug route to help diagnose CORS issues
router.options('/register-direct', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3208');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Create a more direct register route to bypass potential middleware issues
router.post('/register-direct', async (req, res) => {
  try {
    console.log('Direct register request received:', req.body);
    console.log('Request headers:', req.headers);
    
    // Set explicit CORS headers
    res.header('Access-Control-Allow-Origin', 'http://localhost:3208');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    }) as IUser & { _id: mongoose.Types.ObjectId };
    
    // Generate JWT token
    const token = generateToken(user._id.toString());
    
    // Return user data (excluding password)
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Direct registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router; 