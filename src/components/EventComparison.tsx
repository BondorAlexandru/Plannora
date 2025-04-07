import React from 'react';
import { Event } from '../types';

type EventComparisonProps = {
  event1: Event | null;
  event2: Event | null;
  onClose: () => void;
  onSelectEvent: (event: Event) => void;
};

const EventComparison: React.FC<EventComparisonProps> = ({ 
  event1, 
  event2, 
  onClose, 
  onSelectEvent 
}) => {
  // Function to calculate total cost of event
  const calculateTotal = (event: Event | null) => {
    if (!event || !event.selectedProviders) return 0;
    return event.selectedProviders.reduce((total, provider) => total + provider.price, 0);
  };

  // Function to format dates consistently
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-primary-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Event Comparison</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Headers */}
            <div className="font-bold text-gray-500">Details</div>
            <div className="font-bold text-center">{event1?.name || 'Event 1'}</div>
            <div className="font-bold text-center">{event2?.name || 'Event 2'}</div>
            
            {/* Basic Info Section */}
            <div className="col-span-3 bg-gray-100 p-2 mt-4 font-bold">Basic Information</div>
            
            {/* Event Name */}
            <div className="font-medium">Event Name</div>
            <div className="text-center">{event1?.name || '-'}</div>
            <div className="text-center">{event2?.name || '-'}</div>
            
            {/* Event Type */}
            <div className="font-medium">Event Type</div>
            <div className="text-center">{event1?.eventType || '-'}</div>
            <div className="text-center">{event2?.eventType || '-'}</div>
            
            {/* Date */}
            <div className="font-medium">Date</div>
            <div className="text-center">{event1?.date ? formatDate(event1.date) : '-'}</div>
            <div className="text-center">{event2?.date ? formatDate(event2.date) : '-'}</div>
            
            {/* Location */}
            <div className="font-medium">Location</div>
            <div className="text-center">{event1?.location || '-'}</div>
            <div className="text-center">{event2?.location || '-'}</div>
            
            {/* Guest Count */}
            <div className="font-medium">Guest Count</div>
            <div className="text-center">{event1?.guestCount || '-'}</div>
            <div className="text-center">{event2?.guestCount || '-'}</div>
            
            {/* Budget */}
            <div className="font-medium">Budget</div>
            <div className="text-center">${event1?.budget ? event1.budget.toLocaleString() : '-'}</div>
            <div className="text-center">${event2?.budget ? event2.budget.toLocaleString() : '-'}</div>
            
            {/* Total Cost */}
            <div className="font-medium">Total Cost</div>
            <div className="text-center">${calculateTotal(event1).toLocaleString()}</div>
            <div className="text-center">${calculateTotal(event2).toLocaleString()}</div>
            
            {/* Remaining Budget */}
            <div className="font-medium">Remaining Budget</div>
            <div className="text-center">
              {event1?.budget ? 
                `$${(event1.budget - calculateTotal(event1)).toLocaleString()}` : 
                '-'}
            </div>
            <div className="text-center">
              {event2?.budget ? 
                `$${(event2.budget - calculateTotal(event2)).toLocaleString()}` : 
                '-'}
            </div>
            
            {/* Selected Providers Section */}
            <div className="col-span-3 bg-gray-100 p-2 mt-4 font-bold">Services</div>
            
            {/* Provider Comparison */}
            {['Venue', 'Catering', 'Photography', 'Music', 'Decoration', 'Transportation'].map(category => (
              <React.Fragment key={category}>
                <div className="font-medium">{category}</div>
                <div className="text-center">
                  {event1?.selectedProviders?.find(p => p.category === category)?.name || '-'}
                  {event1?.selectedProviders?.find(p => p.category === category) && 
                    <div className="text-sm text-gray-500">
                      ${event1.selectedProviders.find(p => p.category === category)?.price.toLocaleString()}
                    </div>
                  }
                </div>
                <div className="text-center">
                  {event2?.selectedProviders?.find(p => p.category === category)?.name || '-'}
                  {event2?.selectedProviders?.find(p => p.category === category) && 
                    <div className="text-sm text-gray-500">
                      ${event2.selectedProviders.find(p => p.category === category)?.price.toLocaleString()}
                    </div>
                  }
                </div>
              </React.Fragment>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button 
              onClick={() => event1 && onSelectEvent(event1)}
              disabled={!event1}
              className={`px-4 py-2 rounded-lg ${event1 ? 'bg-primary-500 hover:bg-primary-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              Select Event 1
            </button>
            <button 
              onClick={() => event2 && onSelectEvent(event2)}
              disabled={!event2}
              className={`px-4 py-2 rounded-lg ${event2 ? 'bg-primary-500 hover:bg-primary-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              Select Event 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventComparison; 