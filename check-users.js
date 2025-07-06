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
  if (!process.env.MONGODB_URI) {
    return;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    
    const db = client.db('plannora');
    const users = await db.collection('users').find({}).toArray();
    
    if (users.length > 0) {
      users.forEach(user => console.log(' -', user.email));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkUsers(); 