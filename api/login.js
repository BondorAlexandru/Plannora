import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://plannora.vercel.app',
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// MongoDB URI and JWT secret from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Simple User schema for authentication
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
}, { timestamps: true });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create model only if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Connect to MongoDB with timeout
let mongoPromise = null;
async function connectToDatabase() {
  // If connection exists, use it
  if (mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return true;
  }
  
  // If there's a connection in progress, use that promise
  if (mongoPromise) {
    console.log('Waiting for existing connection attempt...');
    return mongoPromise;
  }
  
  // Create a connection promise with timeout
  mongoPromise = new Promise(async (resolve, reject) => {
    // Connection timeout handler
    const timeoutId = setTimeout(() => {
      console.error('MongoDB connection timeout after 5 seconds');
      mongoose.connection.close().catch(() => {});
      reject(new Error('Connection timeout after 5 seconds'));
    }, 5000);
    
    try {
      console.log('Connecting to MongoDB...');
      
      // Fast-fail if MongoDB URI is not defined
      if (!MONGODB_URI) {
        clearTimeout(timeoutId);
        return reject(new Error('MONGODB_URI is not defined'));
      }
      
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 1,
        family: 4, // Force IPv4
      });
      
      clearTimeout(timeoutId);
      console.log('MongoDB connected successfully');
      resolve(true);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('MongoDB connection error:', error);
      reject(error);
    }
  }).finally(() => {
    mongoPromise = null;
  });
  
  return mongoPromise;
}

// Login route
app.post('/api/auth/login', async (req, res) => {
  let connectionSuccessful = false;
  
  try {
    // Try to connect with a timeout
    connectionSuccessful = await Promise.race([
      connectToDatabase(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;
    
    // Simple mock login for testing when MongoDB connection fails
    if (!connectionSuccessful && email === 'test@example.com' && password === 'password') {
      console.log('Using mock login due to DB connection failure');
      const token = jwt.sign({ id: '000000000000000000000001' }, JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });
      
      return res.status(200).json({
        _id: '000000000000000000000001',
        name: 'Test User',
        email: 'test@example.com',
        token
      });
    }
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email (with timeout)
    const findUserPromise = User.findOne({ email }).maxTimeMS(4000).exec();
    const user = await Promise.race([
      findUserPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('User lookup timeout')), 4000))
    ]);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password (with timeout)
    const passwordPromise = user.comparePassword(password);
    const isMatch = await Promise.race([
      passwordPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Password check timeout')), 3000))
    ]);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user._id.toString());
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'none',
      secure: true,
      path: '/'
    });
    
    // Return user data
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.message && error.message.includes('timeout')) {
      return res.status(504).json({ 
        message: 'Login timed out, please try again',
        error: error.message
      });
    }
    return res.status(500).json({ 
      message: 'Server error during login',
      error: error.message
    });
  } finally {
    // Close the connection if we opened it just for this request
    if (!connectionSuccessful && mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.close();
        console.log('Closed temporary MongoDB connection');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
});

// Handle preflight requests
app.options('/api/auth/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'https://plannora.vercel.app');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Health check route
app.get('/api/auth/login', (req, res) => {
  res.status(200).json({
    message: 'Login API is running',
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Export for Vercel serverless
export default app; 