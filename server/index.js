import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();

// Define port
const PORT = process.env.PORT || 5001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alex:Bicrlafs1997@plannora.wac0bxz.mongodb.net/?retryWrites=true&w=majority&appName=Plannora';

// Define User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// User model
const User = mongoose.model('User', userSchema);

// Define Event Schema
const eventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  eventType: {
    type: String,
    default: 'Party'
  },
  guestCount: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  selectedProviders: {
    type: Array,
    default: []
  },
  categories: {
    type: Array,
    default: []
  },
  step: {
    type: Number,
    default: 1
  },
  activeCategory: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Event model
const Event = mongoose.model('Event', eventSchema);

// Setup CORS first (before other middleware)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://plannora.vercel.app', 'https://www.plannora.com'] 
    : 'http://localhost:3209',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Other middleware
app.use(express.json());
app.use(cookieParser());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  next();
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'plannora-secret-key-for-jwt-auth';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Options route for CORS preflight
app.options('/api/auth/register-direct', (req, res) => {
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

// Options route for login CORS preflight
app.options('/api/auth/login', (req, res) => {
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

// Register route
app.post('/api/auth/register-direct', async (req, res) => {
  try {
    console.log('Direct register request received:', req.body);
    console.log('Request headers:', req.headers);
    
    // Set explicit CORS headers
    const origin = process.env.NODE_ENV === 'production'
      ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
        ? req.headers.origin : 'https://plannora.vercel.app')
      : 'http://localhost:3209';
      
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    // Generate JWT token
    const token = generateToken(user._id.toString());
    
    // Return user data (excluding password)
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Direct registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    // Set explicit CORS headers
    const origin = process.env.NODE_ENV === 'production'
      ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
        ? req.headers.origin : 'https://plannora.vercel.app')
      : 'http://localhost:3209';
      
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    try {
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(user._id.toString());
      
      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      // Return user data (excluding password)
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        token
      });
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      return res.status(500).json({ message: 'Error validating credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get user profile route
app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Don't send the password in the response
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Logout route
app.post('/api/auth/logout', async (req, res) => {
  try {
    // Set explicit CORS headers for consistent handling
    const origin = process.env.NODE_ENV === 'production'
      ? (req.headers.origin === 'https://plannora.vercel.app' || req.headers.origin === 'https://www.plannora.com' 
        ? req.headers.origin : 'https://plannora.vercel.app')
      : 'http://localhost:3209';
      
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Clear the token cookie with comprehensive options
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire immediately
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    
    // Also clear any localStorage token on the client side by informing it in response
    return res.status(200).json({ 
      message: 'Logged out successfully',
      clearLocalStorage: true
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
});

// EVENT ROUTES

// Get current/latest event
app.get('/api/events/current', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Find the latest event for this user
    const event = await Event.findOne({ userId }).sort({ updatedAt: -1 });
    
    if (!event) {
      return res.status(404).json({ message: 'No events found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting current event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
app.get('/api/events', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Find all events for this user
    const events = await Event.find({ userId }).sort({ updatedAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting all events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by id
app.get('/api/events/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const eventId = req.params.id;
    
    // Find the event by ID and ensure it belongs to this user
    const event = await Event.findOne({ _id: eventId, userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting event by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update an event
app.post('/api/events', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const eventData = req.body;
    
    // Add the user ID to the event data
    eventData.userId = userId;
    
    // Ensure selectedProviders exists
    if (!eventData.selectedProviders) {
      eventData.selectedProviders = [];
    }
    
    let event;
    
    // If an ID is provided, update the existing event
    if (eventData._id || eventData.id) {
      const eventId = eventData._id || eventData.id;
      
      // Make sure the event belongs to this user
      const existingEvent = await Event.findOne({ 
        _id: eventId, 
        userId 
      });
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Update the event
      event = await Event.findByIdAndUpdate(
        eventId,
        eventData,
        { new: true }
      );
      
      console.log(`Updated existing event with ID: ${eventId}`);
    } else {
      // Check if the user already has events with the same name, to avoid duplicates
      const similarEvent = await Event.findOne({
        userId,
        name: eventData.name
      });
      
      if (similarEvent) {
        // Update the existing event instead of creating a new one
        event = await Event.findByIdAndUpdate(
          similarEvent._id,
          eventData,
          { new: true }
        );
        
        console.log(`Updated similar existing event with ID: ${similarEvent._id}`);
      } else {
        // Create a new event only if no similar event exists
        event = await Event.create(eventData);
        console.log(`Created new event with ID: ${event._id}`);
      }
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error creating/updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new event
app.post('/api/events/new', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const eventData = req.body;
    
    // Add the user ID to the event data
    eventData.userId = userId;
    
    // Ensure selectedProviders exists
    if (!eventData.selectedProviders) {
      eventData.selectedProviders = [];
    }
    
    // Make sure we're not trying to create an event with an existing ID
    if (eventData._id || eventData.id) {
      return res.status(400).json({ 
        message: 'Cannot create new event with an existing ID. Use PUT /api/events/:id to update existing events.' 
      });
    }
    
    // Create a new event
    const event = await Event.create(eventData);
    console.log(`Created new event with ID: ${event._id}`);
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating new event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an event by ID
app.put('/api/events/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const eventId = req.params.id;
    const eventData = req.body;
    
    console.log(`Updating event with ID: ${eventId}`);
    
    // Add the user ID to the event data
    eventData.userId = userId;
    
    // Ensure selectedProviders exists
    if (!eventData.selectedProviders) {
      eventData.selectedProviders = [];
    }
    
    // Make sure the event belongs to this user
    const existingEvent = await Event.findOne({ 
      _id: eventId, 
      userId 
    });
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Remove any ID fields from the request body to prevent MongoDB errors
    delete eventData._id;
    delete eventData.id;
    
    // Update the event
    const event = await Event.findByIdAndUpdate(
      eventId,
      eventData,
      { new: true }
    );
    
    console.log(`Successfully updated event with ID: ${eventId}`);
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an event by ID
app.delete('/api/events/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const eventId = req.params.id;
    
    // Make sure the event belongs to this user
    const existingEvent = await Event.findOne({ 
      _id: eventId, 
      userId 
    });
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete the event
    await Event.findByIdAndDelete(eventId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete current/latest event
app.delete('/api/events/current', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Find the latest event for this user
    const event = await Event.findOne({ userId }).sort({ updatedAt: -1 });
    
    if (!event) {
      return res.status(404).json({ message: 'No events found' });
    }
    
    // Delete the event
    await Event.findByIdAndDelete(event._id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting current event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event step
app.patch('/api/events/step', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { step, eventId } = req.body;
    
    if (!step) {
      return res.status(400).json({ message: 'Step is required' });
    }
    
    let query = { userId };
    
    // If an event ID is provided, update that specific event
    if (eventId) {
      query._id = eventId;
    } else {
      // Otherwise, get the latest event
      const latestEvent = await Event.findOne({ userId }).sort({ updatedAt: -1 });
      if (!latestEvent) {
        return res.status(404).json({ message: 'No events found' });
      }
      query._id = latestEvent._id;
    }
    
    // Update the event step
    const event = await Event.findOneAndUpdate(
      query,
      { step },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event step:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event category
app.patch('/api/events/category', authenticate, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { activeCategory, eventId } = req.body;
    
    if (!activeCategory) {
      return res.status(400).json({ message: 'Active category is required' });
    }
    
    let query = { userId };
    
    // If an event ID is provided, update that specific event
    if (eventId) {
      query._id = eventId;
    } else {
      // Otherwise, get the latest event
      const latestEvent = await Event.findOne({ userId }).sort({ updatedAt: -1 });
      if (!latestEvent) {
        return res.status(404).json({ message: 'No events found' });
      }
      query._id = latestEvent._id;
    }
    
    // Update the event category
    const event = await Event.findOneAndUpdate(
      query,
      { activeCategory },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Get the directory of the current module
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // Serve static files from the dist directory (one level up from /api)
  const distPath = path.resolve(__dirname, '..');
  app.use(express.static(distPath));
  
  // Handle client-side routing - return the index.html for any path except /api
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Export the Express app for serverless use
export default app;

// Only start the server if this file is run directly
if (require.main === module) {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} 