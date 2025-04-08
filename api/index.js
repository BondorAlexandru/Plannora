// A more direct approach for Vercel serverless functions
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Create a new Express app instead of importing the server directly
// This avoids potential circular dependencies and initialization issues
const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://plannora.vercel.app',
  credentials: true
}));

// Simple debug route
app.get('/api/debug', (req, res) => {
  try {
    res.status(200).json({
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      corsOrigin: process.env.CORS_ORIGIN || 'not set'
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint error' });
  }
});

// Simple root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Minimal error handling
app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({ 
    error: { 
      code: '500', 
      message: 'A server error has occurred'
    } 
  });
});

// Forward all other requests to the main server file
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found. API is running but this path does not exist.' });
});

// Export for Vercel serverless
export default app; 