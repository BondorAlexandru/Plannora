// A more direct approach for Vercel serverless functions
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'plannora';
const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB connection cache
let cachedClient = null;

// Connect to MongoDB
async function connectToMongoDB() {
  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
    return cachedClient;
  }
  
  if (cachedClient) {
    try {
      await cachedClient.close();
    } catch (e) {
      // Ignore close errors
    }
    cachedClient = null;
  }
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is undefined');
    return null;
  }
  
  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log('MongoDB connected successfully');
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
}

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies or headers
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const client = await connectToMongoDB();
    if (!client) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Handle the 'admin' case from fallback authentication
    if (decoded.id === 'admin') {
      req.user = {
        _id: 'admin-id',
        name: 'Admin User',
        email: decoded.email || 'admin@example.com',
        isAdmin: true
      };
      return next();
    }
    
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.id) });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// Create a new Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://plannora.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// =========================================
// AUTH ROUTES
// =========================================

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const client = await connectToMongoDB();
    
    // Fallback authentication
    if (!client) {
      if (email === process.env.ADMIN_EMAIL || email === 'admin@example.com') {
        const isMatch = password === process.env.ADMIN_PASSWORD || password === 'password123';
        
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
          { id: 'admin', email: email },
          JWT_SECRET || 'fallback-secret-key',
          { expiresIn: '30d' }
        );
        
        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          sameSite: 'none',
          secure: true,
          path: '/'
        });
        
        return res.status(200).json({
          _id: 'admin-id',
          name: 'Admin User',
          email: email,
          token,
          fallback: true
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const db = client.db(DB_NAME);
    
    // Find users collection
    const collections = await db.listCollections().toArray();
    const usersCollectionName = collections.find(c => 
      c.name.toLowerCase() === 'users' || 
      c.name.toLowerCase() === 'user'
    )?.name;
    
    if (!usersCollectionName) {
      return res.status(500).json({ message: 'Users collection not found' });
    }
    
    const usersCollection = db.collection(usersCollectionName);
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
      path: '/'
    });
    
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});

// Get current user
app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    return res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: true,
    path: '/'
  });
  return res.status(200).json({ message: 'Logged out successfully' });
});

// =========================================
// EVENTS ROUTES
// =========================================

// Get all events for user
app.get('/api/events', authenticate, async (req, res) => {
  try {
    const client = await connectToMongoDB();
    if (!client) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const db = client.db(DB_NAME);
    const eventsCollection = db.collection('events');
    
    const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
    const events = await eventsCollection.find({ user: userId }).toArray();
    
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get current event
app.get('/api/events/current', authenticate, async (req, res) => {
  try {
    const client = await connectToMongoDB();
    if (!client) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const db = client.db(DB_NAME);
    const eventsCollection = db.collection('events');
    
    const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
    
    // Find the most recently updated event or create a new one
    let event = await eventsCollection
      .find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(1)
      .next();
    
    if (!event) {
      // Create a new event if none found
      const newEvent = {
        user: userId,
        name: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        guestCount: 0,
        budget: 0,
        eventType: 'Party',
        selectedProviders: [],
        step: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await eventsCollection.insertOne(newEvent);
      return res.status(201).json({ 
        ...newEvent, 
        _id: result.insertedId 
      });
    }
    
    return res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching current event:', error);
    return res.status(500).json({ message: 'Error fetching current event', error: error.message });
  }
});

// Create new event
app.post('/api/events/new', authenticate, async (req, res) => {
  try {
    const client = await connectToMongoDB();
    if (!client) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const db = client.db(DB_NAME);
    const eventsCollection = db.collection('events');
    
    const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
    
    const newEvent = {
      user: userId,
      name: req.body.name || '',
      date: req.body.date || new Date().toISOString().split('T')[0],
      location: req.body.location || '',
      guestCount: req.body.guestCount || 0,
      budget: req.body.budget || 0,
      eventType: req.body.eventType || 'Party',
      selectedProviders: req.body.selectedProviders || [],
      step: req.body.step || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await eventsCollection.insertOne(newEvent);
    return res.status(201).json({ 
      ...newEvent, 
      _id: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Update event step
app.patch('/api/events/step', authenticate, async (req, res) => {
  try {
    const { eventId, step } = req.body;
    
    if (!eventId || !step) {
      return res.status(400).json({ message: 'Event ID and step are required' });
    }
    
    const client = await connectToMongoDB();
    if (!client) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    const db = client.db(DB_NAME);
    const eventsCollection = db.collection('events');
    
    const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
    
    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(eventId), user: userId },
      { 
        $set: { 
          step: parseInt(step),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Event not found or not owned by user' });
    }
    
    return res.status(200).json({ message: 'Event step updated successfully' });
  } catch (error) {
    console.error('Error updating event step:', error);
    return res.status(500).json({ message: 'Error updating event step', error: error.message });
  }
});

// Expanded debug route
app.get('/api/debug', (req, res) => {
  try {
    res.status(200).json({
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      corsOrigin: process.env.CORS_ORIGIN || 'not set',
      headers: req.headers,
      vercelRegion: process.env.VERCEL_REGION || 'not set'
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'API is running',
    env: process.env.NODE_ENV
  });
});

// Handle CORS preflight requests
app.options('*', cors());

// Improved error handling
app.use((err, req, res, next) => {
  console.error('API error:', err);
  
  // Format error response based on type
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'A server error has occurred';
  
  res.status(statusCode).json({ 
    error: { 
      code: statusCode.toString(), 
      message: errorMessage,
      path: req.path
    } 
  });
});

// Forward all other requests to the main server file
app.all('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found. API is running but this path does not exist.',
    path: req.path
  });
});

// Export for Vercel serverless
export default app; 