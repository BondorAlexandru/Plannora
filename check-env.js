// Check environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both files
dotenv.config({ path: path.join(__dirname, '.env.development') });

// Clear and load production env
Object.keys(process.env).forEach(key => {
  if (key.startsWith('MONGODB_') || key === 'JWT_SECRET') {
    delete process.env[key];
  }
});

dotenv.config({ path: path.join(__dirname, '.env.production') });