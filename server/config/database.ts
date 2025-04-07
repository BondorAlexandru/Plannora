import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection string from .env or use the provided one
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alex:Bicrlafs1997@plannora.wac0bxz.mongodb.net/?retryWrites=true&w=majority&appName=Plannora';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 