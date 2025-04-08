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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
      { expiresIn: '30d' }
    );

    // Return user data without password and with token
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token
    };

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 