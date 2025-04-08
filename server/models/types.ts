import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  userId?: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

export interface IEvent extends Document {
  userId: string;
  name: string;
  date: Date;
  location: string;
  description: string;
  eventType: string;
  guestCount: number;
  budget: number;
  selectedProviders: any[];
  categories: any[];
  step: number;
  activeCategory: string;
  createdAt: Date;
  updatedAt: Date;
} 