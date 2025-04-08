// Authentication routes
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { connectToMongoDB } from '../index.js';
import { authenticate } from '../middleware/auth.js';

export default function authRoutes(app) {
  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const { db } = await connectToMongoDB();
      
      // Fallback authentication for when DB is not available
      if (!db) {
        if (email === process.env.ADMIN_EMAIL || email === 'admin@example.com') {
          const isMatch = password === process.env.ADMIN_PASSWORD || password === 'password123';
          
          if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
          
          const token = jwt.sign(
            { id: 'admin', email: email },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '30d' }
          );
          
          res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'none',
            secure: true,
            path: '/'
          });
          
          return res.status(200).json({
            _id: 'admin-id',
            name: 'Admin User',
            email: email,
            token,
            fallback: true
          });
        }
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Normal authentication flow
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ email });
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true,
        path: '/'
      });
      
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const usersCollection = db.collection('users');
      
      // Check if user exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const newUser = {
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(newUser);
      const user = {
        _id: result.insertedId,
        name: newUser.name,
        email: newUser.email
      };
      
      // Create token
      const token = jwt.sign(
        { id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true,
        path: '/'
      });
      
      return res.status(201).json({
        ...user,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  });

  // Get current user
  app.get('/api/auth/profile', authenticate, async (req, res) => {
    try {
      return res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt
      });
    } catch (error) {
      console.error('Profile error:', error);
      return res.status(500).json({ message: 'Error fetching profile' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'none',
      secure: true,
      path: '/'
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  });
} 