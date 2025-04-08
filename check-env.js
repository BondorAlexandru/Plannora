// Check environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both files
console.log("Loading .env.development:");
dotenv.config({ path: path.join(__dirname, '.env.development') });
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not found');

// Clear and load production env
Object.keys(process.env).forEach(key => {
  if (key.startsWith('MONGODB_') || key === 'JWT_SECRET') {
    delete process.env[key];
  }
});

console.log("\nLoading .env.production:");
dotenv.config({ path: path.join(__dirname, '.env.production') });
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Not found'); 