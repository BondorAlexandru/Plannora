// Main API handler for Vercel serverless functions
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import { createRouter } from './routes/index.js';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.production') });
  console.log('Loaded production environment variables');
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
  console.log('Loaded development environment variables');
}

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'plannoraDatabase';

// MongoDB connection cache
let cachedClient = null;
let cachedDb = null;

// Connect to MongoDB
export async function connectToMongoDB() {
  // Log important information for debugging
  console.log(`Connecting to MongoDB (cached: ${!!cachedClient})`);
  console.log(`DB_NAME: ${DB_NAME}`);
  console.log(`MONGODB_URI exists: ${!!MONGODB_URI}`);
  
  // Check if we have a cached connection that's still connected
  if (cachedClient && cachedDb) {
    try {
      // Ping to verify connection is still alive
      await cachedDb.command({ ping: 1 });
      console.log('Using cached MongoDB connection');
      return { client: cachedClient, db: cachedDb };
    } catch (e) {
      console.log('Cached connection is stale, creating new connection');
      // If ping fails, connection is stale - continue to create a new one
      try {
        await cachedClient.close();
      } catch (closeErr) {
        // Ignore close errors
      }
      cachedClient = null;
      cachedDb = null;
    }
  }
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is undefined - check your environment variables');
    return { client: null, db: null };
  }
  
  try {
    console.log('Creating new MongoDB connection');
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000, // Increased timeout
      connectTimeoutMS: 10000, // Added explicit connect timeout
      retryWrites: true, // Ensure retry writes is enabled
      retryReads: true, // Ensure retry reads is enabled
      w: 'majority', // Write concern
    });
    
    await client.connect();
    console.log('MongoDB connected successfully');
    
    const db = client.db(DB_NAME);
    
    // Test connection with a simple command
    await db.command({ ping: 1 });
    console.log('MongoDB ping successful');
    
    // Cache the client and db instances
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:');
    console.error(error);
    
    // More detailed error logging
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server in the cluster');
      console.error('This may be due to network access restrictions or incorrect connection string');
    }
    
    if (error.message && error.message.includes('authentication failed')) {
      console.error('MongoDB authentication failed - check username and password');
    }
    
    return { client: null, db: null };
  }
}

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.vercel\.app$/, /\.plannora\.com$/, '*'] 
    : ['http://localhost:3209', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create and attach routers
createRouter(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'production' ? undefined : err.message 
  });
});

// WebSocket authentication helper
function authenticateWS(token) {
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' if present
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    return null;
  }
}

// Create HTTP server
const server = createServer(app);

// WebSocket server for real-time chat
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Store active WebSocket connections by collaboration ID
const collaborationConnections = new Map();

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection');
  
  let user = null;
  let collaborationId = null;
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      // Handle authentication
      if (message.type === 'auth') {
        user = authenticateWS(message.token);
        collaborationId = message.collaborationId;
        
        if (user && collaborationId) {
          // Verify user has access to this collaboration
          const { db } = await connectToMongoDB();
          if (db) {
            const collaboration = await db.collection('collaborations').findOne({
              _id: new ObjectId(collaborationId),
              $or: [
                { clientId: new ObjectId(user._id) },
                { plannerId: new ObjectId(user._id) }
              ],
              status: 'active'
            });
            
            if (collaboration) {
              // Add connection to the collaboration room
              if (!collaborationConnections.has(collaborationId)) {
                collaborationConnections.set(collaborationId, new Set());
              }
              collaborationConnections.get(collaborationId).add(ws);
              
              ws.collaborationId = collaborationId;
              ws.user = user;
              
              console.log(`✅ User ${user.name} joined collaboration ${collaborationId}`);
              ws.send(JSON.stringify({ type: 'auth_success' }));
            } else {
              ws.send(JSON.stringify({ type: 'auth_error', message: 'Access denied' }));
            }
          }
        } else {
          ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
        }
      }
      
      // Handle chat messages
      if (message.type === 'chat_message' && user && collaborationId) {
        const { db } = await connectToMongoDB();
        if (db) {
          // Save message to database
          const chatMessage = {
            collaborationId: new ObjectId(collaborationId),
            senderId: new ObjectId(user._id),
            message: message.content.trim(),
            timestamp: new Date(),
            edited: false,
            editedAt: null
          };
          
          const result = await db.collection('collaborationMessages').insertOne(chatMessage);
          
          // Create response with sender info
          const responseMessage = {
            type: 'new_message',
            message: {
              _id: result.insertedId,
              ...chatMessage,
              senderName: user.name
            }
          };
          
          // Broadcast to all connections in this collaboration
          const connections = collaborationConnections.get(collaborationId);
          if (connections) {
            connections.forEach(connection => {
              if (connection.readyState === ws.OPEN) {
                connection.send(JSON.stringify(responseMessage));
              }
            });
          }
          
          console.log(`💬 Message from ${user.name} in collaboration ${collaborationId}`);
        }
      }
      
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    
    // Remove connection from collaboration room
    if (collaborationId && collaborationConnections.has(collaborationId)) {
      collaborationConnections.get(collaborationId).delete(ws);
      
      // Clean up empty collaboration rooms
      if (collaborationConnections.get(collaborationId).size === 0) {
        collaborationConnections.delete(collaborationId);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the server directly (ES modules approach)
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});

// Export handler for Vercel
export default app; 