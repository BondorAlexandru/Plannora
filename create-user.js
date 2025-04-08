// ES Modules script to create a test user
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.development
dotenv.config({ path: path.join(__dirname, '.env.development') });

async function createTestUser() {
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
  
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set');
    return;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db('plannora');
    const usersCollection = db.collection('users');
    
    // Check if test user exists
    const existingUser = await usersCollection.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return;
    }
    
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const result = await usersCollection.insertOne({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Test user created successfully with ID:', result.insertedId);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestUser(); 