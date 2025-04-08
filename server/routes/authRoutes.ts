import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { connectToDatabase } from '../config/database.js';
import { IUser } from '../models/types.js';

const router = express.Router();

// Options route for CORS preflight - register
router.options('/register-direct', (req, res) => {
  const origin = process.env.NODE_ENV === 'production'
    ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
      ? req.headers.origin : 'https://plannora.vercel.app')
    : 'http://localhost:3209';
    
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Options route for login CORS preflight
router.options('/login', (req, res) => {
  const origin = process.env.NODE_ENV === 'production'
    ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
      ? req.headers.origin : 'https://plannora.vercel.app')
    : 'http://localhost:3209';
    
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Register route
router.post('/register-direct', async (req, res) => {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    
    console.log('Direct register request received:', req.body);
    console.log('Request headers:', req.headers);
    
    // Set explicit CORS headers
    const origin = process.env.NODE_ENV === 'production'
      ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
        ? req.headers.origin : 'https://plannora.vercel.app')
      : 'http://localhost:3209';
      
    res.header('Access-Control-Allow-Origin', origin);
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
    }) as IUser;
    
    // Generate JWT token
    const token = generateToken(user._id.toString());
    
    // Return user data (excluding password)
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error: any) {
    console.error('Direct registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    
    // Use environment variable for CORS
    const origin = process.env.CORS_ORIGIN || 'https://plannora.vercel.app';
      
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email }) as IUser;
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    try {
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(user._id.toString());
      
      // Set token in cookie - with more compatible settings for Vercel
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'none',
        secure: true,
        path: '/'
      });
      
      // Return user data (excluding password) 
      // Also include token in the response body for client-side storage
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        token
      });
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      return res.status(500).json({ message: 'Error validating credentials' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    // More detailed error logging for debugging
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user profile route
router.get('/profile', authenticate, async (req, res) => {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Don't send the password in the response
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    // Connect to MongoDB first (in case we need to do any user-related operations)
    await connectToDatabase();
    
    // Set explicit CORS headers for consistent handling
    const origin = process.env.NODE_ENV === 'production'
      ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
        ? req.headers.origin : 'https://plannora.vercel.app')
      : 'http://localhost:3209';
      
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Clear the token cookie with comprehensive options
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire immediately
      sameSite: 'none',
      path: '/'
    });
    
    // Also clear any localStorage token on the client side by informing it in response
    return res.status(200).json({ 
      message: 'Logged out successfully',
      clearLocalStorage: true
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
});

export default router; 