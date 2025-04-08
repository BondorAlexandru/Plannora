// Import the server app from the server directory
import app from '../server/index.js';

// Add error handling for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ 
    error: { 
      code: '500', 
      message: 'A server error has occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    } 
  });
});

// Add specific CORS handling for auth routes in production
app.options('/api/auth/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://plannora.vercel.app');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

app.options('/api/auth/logout', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://plannora.vercel.app');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Export for Vercel serverless
export default app; 