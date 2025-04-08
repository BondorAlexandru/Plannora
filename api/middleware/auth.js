// Authentication middleware
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { connectToMongoDB } from '../index.js';

// Middleware to authenticate JWT tokens
export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies or headers
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const { db } = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
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