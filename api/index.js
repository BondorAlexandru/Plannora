// Main API handler for Vercel serverless functions
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { createRouter } from './routes/index.js';

// Load environment variables
dotenv.config();

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'plannora';

// MongoDB connection cache
let cachedClient = null;
let cachedDb = null;

// Connect to MongoDB
export async function connectToMongoDB() {
  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
    return { client: cachedClient, db: cachedDb };
  }
  
  if (cachedClient) {
    try {
      await cachedClient.close();
    } catch (e) {
      // Ignore close errors
    }
    cachedClient = null;
    cachedDb = null;
  }
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is undefined');
    return { client: null, db: null };
  }
  
  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log('MongoDB connected successfully');
    
    const db = client.db(DB_NAME);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return { client: null, db: null };
  }
}

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.vercel\.app$/, /\.plannora\.com$/, '*'] 
    : 'http://localhost:3209',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create and attach routers
createRouter(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'production' ? undefined : err.message 
  });
});

// Export handler for Vercel
export default app; 