import { ProviderCategory } from './data/mockData';

export interface Event {
  id?: string;
  name: string;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  eventType: string;
  selectedProviders: SelectedProvider[];
}

export interface SelectedProvider {
  id: string;
  name: string;
  price: number;
  category: ProviderCategory;
  image: string;
  isPerPerson?: boolean;
  originalPrice?: number;
} 