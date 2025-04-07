import { Provider, ProviderCategory } from '../data/mockData';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  providerId: string;
  category: ProviderCategory;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  guests: number;
  budget: number;
  services: Service[];
} 