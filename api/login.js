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
const DB_NAME = process.env.DB_NAME || 'plannora';

// MongoDB connection cache
let cachedClient = null;

// Get MongoDB client with minimal settings
async function connectToMongoDB() {
  // Use cached connection if available
  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
    return cachedClient;
  }
  
  // Reset cached client if it exists but isn't connected
  if (cachedClient) {
    try {
      await cachedClient.close();
    } catch (e) {
      // Ignore close errors
    }
    cachedClient = null;
  }
  
  // Check if MONGODB_URI is defined
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is undefined');
    return null;
  }
  
  // Try to connect with retries
  let retries = 2;
  let lastError = null;
  
  while (retries >= 0) {
    try {
      // Create new connection with minimal settings
      console.log(`MongoDB connection attempt ${2 - retries + 1}`);
      const client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 2000, // Reduced timeout for faster retries
        socketTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      });
      
      await client.connect();
      console.log('MongoDB connected successfully');
      cachedClient = client;
      return client;
    } catch (error) {
      console.error(`MongoDB connection error (${2 - retries + 1}):`, error.message);
      lastError = error;
      retries--;
      
      if (retries >= 0) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }
  
  console.error('All MongoDB connection attempts failed:', lastError);
  return null;
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
      
      // If database connection fails, use fallback authentication
      if (!client) {
        console.log('Using fallback authentication');
        return handleFallbackAuthentication(email, password, res);
      }
      
      // Use explicit database name
      const db = client.db(DB_NAME);
      
      // Debug: Check the database name
      const dbName = db.databaseName;
      console.log('Connected to database:', dbName);
      
      try {
        // List all collections to find the users collection
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name).join(', '));
        
        // Try to find the users collection (case insensitive)
        const usersCollectionName = collections.find(c => 
          c.name.toLowerCase() === 'users' || 
          c.name.toLowerCase() === 'user'
        )?.name;
        
        if (!usersCollectionName) {
          return res.status(500).json({ 
            message: 'Users collection not found',
            available: collections.map(c => c.name)
          });
        }
        
        console.log('Using collection:', usersCollectionName);
        const usersCollection = db.collection(usersCollectionName);
        
        // Find user with logging
        console.log('Looking for user with email:', email);
        const user = await usersCollection.findOne({ email });
        
        // User not found
        if (!user) {
          console.log('User not found:', email);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        console.log('User found, verifying password');
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          console.log('Password mismatch for:', email);
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        console.log('Password verified, generating token');
        
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
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        return res.status(500).json({ 
          message: 'Database operation failed',
          error: dbError.message
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error information
      if (error.name === 'MongoServerSelectionError') {
        return res.status(500).json({ 
          message: 'Could not connect to database',
          error: error.message 
        });
      }
      
      if (error.name === 'MongoNetworkError') {
        return res.status(500).json({ 
          message: 'Network error connecting to database',
          error: error.message 
        });
      }
      
      return res.status(500).json({ 
        message: 'Authentication failed',
        error: error.message,
        name: error.name
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}

// Fallback authentication for when database is unavailable
// This should be replaced with a more secure solution in production
async function handleFallbackAuthentication(email, password, res) {
  try {
    // Check if email matches admin email
    if (email === process.env.ADMIN_EMAIL || email === 'admin@example.com') {
      // Check if password matches admin password
      const isMatch = password === process.env.ADMIN_PASSWORD || password === 'password123';
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: 'admin', email: email },
        JWT_SECRET || 'fallback-secret-key',
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
        _id: 'admin-id',
        name: 'Admin User',
        email: email,
        token,
        fallback: true
      });
    }
    
    // If not admin, just reject
    return res.status(401).json({ 
      message: 'Invalid credentials',
      fallback: true
    });
  } catch (error) {
    console.error('Fallback authentication error:', error);
    return res.status(500).json({ 
      message: 'Authentication failed',
      error: error.message,
      fallback: true
    });
  }
} 