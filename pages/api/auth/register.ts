import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// Mock user storage (in a real app, you'd use a database)
let users = [
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
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
      { expiresIn: '30d' }
    );

    // Return user data without password and with token
    const userWithoutPassword = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      token
    };

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 