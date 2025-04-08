import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

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

// Connect to MongoDB
let isConnected = false;
let connectionPromise = null;

async function connectToDatabase() {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  // If there's a connection attempt in progress, wait for it
  if (connectionPromise) {
    console.log('Connection in progress, waiting...');
    await connectionPromise;
    return;
  }

  // Create a new connection promise
  connectionPromise = (async () => {
    try {
      console.log('Creating new database connection');
      console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
      
      // Ensure we have a MongoDB URI
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }
      
      await mongoose.connect(uri, {
        // Serverless-friendly options
        serverSelectionTimeoutMS: 10000, // Increased timeout for server selection
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10, // Limit pool size for serverless
        minPoolSize: 0,   // Allow all connections to close when idle
      });
      
      isConnected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      // Reset for retry
      isConnected = false;
      throw error; // Re-throw for proper error handling
    } finally {
      connectionPromise = null;
    }
  })();

  // Wait for the connection
  await connectionPromise;
}

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    
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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
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
if (import.meta.url === `file://${process.argv[1]}`) {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} 