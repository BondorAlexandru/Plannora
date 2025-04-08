// ES Modules script to check MongoDB users
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.development
dotenv.config({ path: path.join(__dirname, '.env.development') });

async function checkUsers() {
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
    const users = await db.collection('users').find({}).toArray();
    
    console.log('Users in database:', users.length);
    if (users.length > 0) {
      // Just print email addresses for privacy
      console.log('User emails:');
      users.forEach(user => console.log(' -', user.email));
    } else {
      console.log('No users found in the database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkUsers(); 