// Simple test endpoint to verify API is working on Vercel
export default function handler(req, res) {
  res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: true
  });
} 