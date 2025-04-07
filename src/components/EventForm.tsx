import React from 'react';
import { useEvent } from '../context/EventContext';

export default function EventForm() {
  const { eventConfig, setEventName, setEventDate, setGuestCount } = useEvent();

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="bg-primary-600 text-white px-6 py-4">
        <h2 className="text-xl font-semibold">Event Details</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              id="eventName"
              value={eventConfig.name}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name"
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              id="eventDate"
              value={eventConfig.date}
              onChange={(e) => setEventDate(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              id="guestCount"
              min="1"
              value={eventConfig.guestCount || ''}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
              placeholder="Enter number of guests"
              className="form-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used to calculate catering costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 