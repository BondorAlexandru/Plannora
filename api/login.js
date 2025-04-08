import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'https://plannora.vercel.app';

// MongoDB connection cache
let cachedClient = null;

// Get MongoDB client with minimal settings
async function connectToMongoDB() {
  // Use cached connection if available
  if (cachedClient) {
    return cachedClient;
  }
  
  // Create new connection with minimal settings
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 3000,
  });
  
  await client.connect();
  cachedClient = client;
  return client;
}

// Main handler function
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Login API is running' });
  }
  
  // Handle login requests
  if (req.method === 'POST') {
    try {
      const { email, password } = req.body;
      
      // Validate inputs
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Connect to MongoDB
      const client = await connectToMongoDB();
      const db = client.db();
      const usersCollection = db.collection('users');
      
      // Find user (with timeout protection)
      const user = await usersCollection.findOne({ email });
      
      // User not found
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id.toString() },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      // Set cookie
      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'none',
        secure: true,
        path: '/'
      }));
      
      // Return user data
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Authentication failed' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 