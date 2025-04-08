import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// Mock user data (in a real app, you'd fetch from a database)
const users = [
  {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be hashed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production'
    ) as { id: string };

    // Find user by ID from token
    const user = users.find(u => u._id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without password
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
} 