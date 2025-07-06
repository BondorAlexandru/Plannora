#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.production
dotenv.config({ path: path.join(__dirname, '.env.production') });

async function testConnection() {
  if (!process.env.MONGODB_URI) {
    return;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    // Add a shorter timeout for quicker feedback
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });
  
  try {
    await client.connect();
    
    const db = client.db(process.env.DB_NAME || 'plannora');
    
    // List collections to verify further access
    const collections = await db.listCollections().toArray(); 
    if (collections.length === 0) {
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    // Try to access the users collection
    const usersCount = await db.collection('users').countDocuments();
    console.log(`Users in database: ${usersCount}`);
    
    console.log('\nMongoDB connection test completed successfully!');
    console.log('This confirms your connection string and network access are working.');
  } catch (error) {
    console.error('❌ MongoDB connection error:');
    console.error(error);
    
    console.log('\nTroubleshooting Steps:');
    console.log('1. Verify your MongoDB Atlas IP Access List includes:');
    console.log('   - Your current IP address');
    console.log('   - 0.0.0.0/0 (Allow access from anywhere) for testing');
    console.log('2. Check if your password contains special characters that need URL encoding');
    console.log('3. Verify the cluster name and configuration in your connection string');
  } finally {
    try {
      await client.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}

testConnection(); 