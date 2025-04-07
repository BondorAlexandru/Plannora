import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Provider, ProviderCategory } from '../data/mockData';
import { Event, SelectedProvider } from '../types';

export interface EventItem {
  provider: Provider;
  quantity: number;
}

export interface EventConfig {
  name: string;
  date: string;
  guestCount: number;
  items: EventItem[];
}

interface EventContextType {
  eventConfig: EventConfig;
  setEventName: (name: string) => void;
  setEventDate: (date: string) => void;
  setGuestCount: (count: number) => void;
  addItem: (provider: Provider, quantity: number) => void;
  removeItem: (providerId: string) => void;
  updateItemQuantity: (providerId: string, quantity: number) => void;
  calculateTotal: () => number;
  getItemsByCategory: (category: ProviderCategory) => EventItem[];
  reset: () => void;
  syncWithLocalStorage: () => Event | null;
}

const defaultEventConfig: EventConfig = {
  name: '',
  date: '',
  guestCount: 0,
  items: [],
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [eventConfig, setEventConfig] = useState<EventConfig>(defaultEventConfig);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEvent = localStorage.getItem('event');
    if (savedEvent) {
      try {
        const parsedEvent: Event = JSON.parse(savedEvent);
        setEventConfig({
          name: parsedEvent.name || '',
          date: parsedEvent.date || '',
          guestCount: parsedEvent.guestCount || 0,
          items: parsedEvent.selectedProviders.map(provider => ({
            provider: {
              id: provider.id,
              name: provider.name,
              price: provider.price,
              category: provider.category,
              description: '',
              rating: 0,
              image: provider.image
            } as Provider,
            quantity: 1
          }))
        });
      } catch (e) {
        console.error("Failed to parse saved event data", e);
      }
    }
  }, []);

  const setEventName = (name: string) => {
    setEventConfig((prev) => ({ ...prev, name }));
  };

  const setEventDate = (date: string) => {
    setEventConfig((prev) => ({ ...prev, date }));
  };

  const setGuestCount = (count: number) => {
    setEventConfig((prev) => ({ ...prev, guestCount: count }));
  };

  const addItem = (provider: Provider, quantity: number) => {
    setEventConfig((prev) => {
      // Check if the item already exists
      const existingItemIndex = prev.items.findIndex(
        (item) => item.provider.id === provider.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prev.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity,
        };
        return { ...prev, items: updatedItems };
      } else {
        // Add new item
        return {
          ...prev,
          items: [...prev.items, { provider, quantity }],
        };
      }
    });
  };

  const removeItem = (providerId: string) => {
    setEventConfig((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.provider.id !== providerId),
    }));
  };

  const updateItemQuantity = (providerId: string, quantity: number) => {
    setEventConfig((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.provider.id === providerId ? { ...item, quantity } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  const calculateTotal = () => {
    return eventConfig.items.reduce(
      (total, item) => total + item.provider.price * item.quantity,
      0
    );
  };

  const getItemsByCategory = (category: ProviderCategory) => {
    return eventConfig.items.filter(
      (item) => item.provider.category === category
    );
  };

  const reset = () => {
    setEventConfig(defaultEventConfig);
    localStorage.removeItem('event');
  };

  // Sync current context state to the localStorage event format
  const syncWithLocalStorage = (): Event | null => {
    const event: Event = {
      name: eventConfig.name,
      date: eventConfig.date,
      location: '',
      guestCount: eventConfig.guestCount,
      budget: 0,
      eventType: 'Party',
      selectedProviders: eventConfig.items.map(item => ({
        id: item.provider.id,
        name: item.provider.name,
        price: item.provider.price,
        category: item.provider.category,
        image: item.provider.image
      }))
    };
    
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  };

  return (
    <EventContext.Provider
      value={{
        eventConfig,
        setEventName,
        setEventDate,
        setGuestCount,
        addItem,
        removeItem,
        updateItemQuantity,
        calculateTotal,
        getItemsByCategory,
        reset,
        syncWithLocalStorage
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}; 