import React, { useState, FormEvent } from 'react';
import { useEvent } from '../context/EventContext';
import { Event } from '../types';

interface EventFormProps {
  initialValues?: Event;
  onSubmit?: (event: Partial<Event>) => void;
  isExistingEvent?: boolean;
}

export default function EventForm({ initialValues, onSubmit, isExistingEvent }: EventFormProps) {
  const { eventConfig, setEventName, setEventDate, setGuestCount } = useEvent();
  
  // Use initialValues if provided (for the Create component) or create default values
  const [eventData, setEventData] = useState<Event>(initialValues || {
    name: eventConfig.name || '',
    date: eventConfig.date || '',
    location: '',
    guestCount: eventConfig.guestCount || 0,
    budget: 0,
    eventType: 'Party',
    selectedProviders: []
  } as Event);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // If using the context-based approach
    if (!onSubmit) {
      if (name === 'name') setEventName(value);
      else if (name === 'date') setEventDate(value);
      else if (name === 'guestCount') setGuestCount(parseInt(value) || 0);
    }
    
    // Always update local state
    setEventData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(eventData);
    }
  };

  // Use the name from context if this is the original implementation, or from local state if using the new approach
  const name = onSubmit ? eventData.name : eventConfig.name;
  const date = onSubmit ? eventData.date : eventConfig.date;
  const guestCount = onSubmit ? eventData.guestCount : eventConfig.guestCount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Event Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name || ''}
          onChange={handleChange}
          placeholder="Enter your event name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Event Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={date || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>
      
      {onSubmit && (
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={eventData.location || ''}
            onChange={handleChange}
            placeholder="Event location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
      )}
      
      {onSubmit && (
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            id="eventType"
            name="eventType"
            value={eventData.eventType || 'Party'}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="Party">Party</option>
            <option value="Wedding">Wedding</option>
            <option value="Corporate">Corporate</option>
            <option value="Birthday">Birthday</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}
      
      <div className={onSubmit ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
        <div>
          <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests
          </label>
          <input
            type="number"
            id="guestCount"
            name="guestCount"
            min="1"
            value={guestCount || ''}
            onChange={handleChange}
            placeholder="Number of guests"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        {onSubmit && (
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget ($)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              min="0"
              value={eventData.budget || ''}
              onChange={handleChange}
              placeholder="Your budget"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        )}
      </div>
      
      {onSubmit && (
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold py-3 px-6 rounded-full shadow-button transform transition hover:-translate-y-1"
          >
            {isExistingEvent ? "Continue to Select Services" : "Create New Event"}
          </button>
        </div>
      )}
    </form>
  );
} 