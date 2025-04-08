import { ProviderCategory } from './data/mockData';

export interface Event {
  id?: string;
  _id?: string;
  name: string;
  date: string;
  time?: string;
  location: string;
  description?: string;
  guestCount: number;
  budget: number;
  eventType: string;
  selectedProviders: SelectedProvider[];
  step?: number;
  activeCategory?: string;
  categories?: Record<string, any>;
}

export interface SelectedProvider {
  id: string;
  name: string;
  price: number;
  category: ProviderCategory;
  image: string;
  isPerPerson?: boolean;
  originalPrice?: number;
  offerId?: string;
  offerName?: string;
} 