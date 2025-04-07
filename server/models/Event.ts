import mongoose from 'mongoose';
import { IUser } from './User';

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

const eventSchema = new mongoose.Schema<IEvent>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  location: {
    type: String,
    default: ''
  },
  guestCount: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  eventType: {
    type: String,
    default: 'Party'
  },
  selectedProviders: {
    type: [selectedProviderSchema],
    default: []
  },
  activeCategory: {
    type: String
  },
  step: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event; 