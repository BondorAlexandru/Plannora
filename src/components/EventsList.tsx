import React from 'react';
import { Event } from '../types';

interface EventsListProps {
  events: Event[];
  isLoading: boolean;
  onSelectEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string, eventName: string) => void;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  isLoading,
  onSelectEvent,
  onDeleteEvent
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="spinner animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        You don't have any saved events yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((userEvent) => (
        <div 
          key={userEvent._id || userEvent.id} 
          className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 transition-colors cursor-pointer"
          onClick={() => onSelectEvent(userEvent)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-heading font-semibold text-gray-800">
                {userEvent.name || 'Unnamed Event'}
              </h4>
              <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                <p>
                  <span className="font-medium">Type: </span>
                  {userEvent.eventType}
                </p>
                {userEvent.date && (
                  <p>
                    <span className="font-medium">Date: </span>
                    {new Date(userEvent.date).toLocaleDateString()}
                  </p>
                )}
                <p>
                  <span className="font-medium">Guests: </span>
                  {userEvent.guestCount}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors shadow-sm text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEvent(userEvent);
                }}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEvent(userEvent._id || userEvent.id || '', userEvent.name);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsList; 