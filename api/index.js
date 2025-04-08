// A more direct approach for Vercel serverless functions
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a new Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://plannora.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
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