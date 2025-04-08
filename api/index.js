// Import the server app from the server directory
import app from '../server/index.js';

// Add a debug route to verify the API is running and environment is properly set
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasMongoURI: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN || 'not set'
  });
});

// Add error handling for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err);
  // Detailed console logging for debugging
  console.error('Error stack:', err.stack);
  console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  
  res.status(500).json({ 
    error: { 
      code: '500', 
      message: 'A server error has occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      path: req.path
    } 
  });
});

// Add specific CORS handling for auth routes in production
app.options('/api/auth/login', (req, res) => {
  const origin = process.env.CORS_ORIGIN || req.headers.origin || 'https://plannora.vercel.app';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

app.options('/api/auth/logout', (req, res) => {
  const origin = process.env.CORS_ORIGIN || req.headers.origin || 'https://plannora.vercel.app';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Export for Vercel serverless
export default app; 