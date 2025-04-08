import mongoose from 'mongoose';
import { IEvent } from './types.js';

// Interface for a selected provider/service
interface SelectedProvider {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  isPerPerson?: boolean;
  offerId?: string;
  offerName?: string;
}

// Interface for the Event document
export interface IEvent extends mongoose.Document {
  user: IUser['_id'];
  name: string;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  eventType: string;
  selectedProviders: SelectedProvider[];
  activeCategory?: string;
  step?: number;
  createdAt: Date;
  updatedAt: Date;
}

const selectedProviderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isPerPerson: {
    type: Boolean,
    default: false
  },
  offerId: {
    type: String
  },
  offerName: {
    type: String
  }
});

// Define Event Schema
const eventSchema = new mongoose.Schema<IEvent>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  eventType: {
    type: String,
    default: 'Party'
  },
  guestCount: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  selectedProviders: {
    type: Array,
    default: []
  },
  categories: {
    type: Array,
    default: []
  },
  step: {
    type: Number,
    default: 1
  },
  activeCategory: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Event model
const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event; 