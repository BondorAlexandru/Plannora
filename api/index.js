// Import the server app from the server directory
import app from '../server/index.js';

// Add specific CORS handling for auth routes in production
app.options('/api/auth/logout', (req, res) => {
  const origin = process.env.NODE_ENV === 'production'
    ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
      ? req.headers.origin : 'https://plannora.vercel.app')
    : 'http://localhost:3209';
    
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Export for Vercel serverless
export default app; 