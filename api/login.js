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

// Connection cache
let cachedConnection = null;

// Connect to MongoDB with optimized settings for serverless
async function connectToDatabase() {
  // If connection exists and is ready, use it
  if (mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }
  
  // If cached connection exists, return it
  if (cachedConnection) {
    console.log('Using cached connection');
    return cachedConnection;
  }
  
  console.log('Creating new MongoDB connection');
  
  // Fast-fail if MongoDB URI is not defined
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  // Configure connection with optimized settings for serverless
  mongoose.set('strictQuery', false);
  
  try {
    cachedConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increased timeout for serverless
      socketTimeoutMS: 45000,          // Increased for Vercel
      connectTimeoutMS: 15000,         // Increased for slower connections
      maxPoolSize: 10,                 // Increased pool size
      minPoolSize: 1,                  // Ensure at least one connection
      maxIdleTimeMS: 10000,            // Close idle connections after 10s
      family: 4,                       // Force IPv4
    });
    
    console.log('MongoDB connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Login route
app.post('/api/auth/login', async (req, res) => {
  console.log('Login request received');
  
  try {
    await connectToDatabase();
    
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email with increased timeout
    const user = await User.findOne({ email }).maxTimeMS(10000).exec();
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user._id.toString());
    console.log('Login successful for:', email);
    
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
    
    // Provide more specific error messages
    if (error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ 
        message: 'Database connection failed, please try again later',
        error: error.message
      });
    }
    
    if (error.message && error.message.includes('timeout')) {
      return res.status(504).json({ 
        message: 'Login request timed out, please try again',
        error: error.message
      });
    }
    
    return res.status(500).json({ 
      message: 'Server error during login',
      error: error.message
    });
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