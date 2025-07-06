import { ProviderCategory } from '../data/mockData';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  providerId: string;
  category: ProviderCategory;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  accountType: 'client' | 'planner';
  plannerProfile?: PlannerProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlannerProfile {
  businessName: string;
  services: string[];
  experience: string;
  description: string;
  pricing: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface Planner {
  id: string;
  name: string;
  email: string;
  businessName: string;
  services: string[];
  experience: string;
  description: string;
  pricing: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
}

export interface MatchRequest {
  _id: string;
  senderId: string;
  receiverId: string;
  eventId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  senderName?: string;
  receiverName?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}

export interface Collaboration {
  _id: string;
  clientId: string;
  plannerId: string;
  eventId: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  clientName: string;
  plannerName: string;
  plannerBusinessName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
}

export interface ChatMessage {
  _id: string;
  collaborationId: string;
  senderId: string;
  message: string;
  timestamp: string;
  edited: boolean;
  editedAt?: string;
  senderName: string;
  isCurrentUser: boolean;
}

export interface VendorNote {
  _id: string;
  collaborationId: string;
  eventId: string;
  providerId: string;
  authorId: string;
  note: string;
  rating?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorName: string;
  isCurrentUser: boolean;
}

export interface Event {
  _id?: string;
  id?: string;
  name: string;
  eventType: string;
  date: string;
  time?: string;
  location: string;
  budget: number;
  guestCount: number;
  step: number;
  categories: Record<string, any>;
  activeCategory: string;
  selectedProviders: SelectedProvider[];
  user?: string;
  collaborators?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SelectedProvider {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  isPerPerson?: boolean;
  image: string;
  description: string;
  rating?: number;
  offerId?: string;
  offerName?: string;
}

export interface EventContextType {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  navigateTo: (path: string, replace?: boolean) => void;
} 