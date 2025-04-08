import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alex:Bicrlafs1997@plannora.wac0bxz.mongodb.net/?retryWrites=true&w=majority&appName=Plannora';

// Connection state
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export async function connectToDatabase() {
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