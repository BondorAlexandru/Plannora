import React from 'react';
import { Event } from '../../../types';
import { Collaboration } from '../types';
import EventForm from '../../../components/EventForm';

interface EventEditTabProps {
  event: Event;
  collaboration: Collaboration;
  onEventUpdate: (updatedEvent: Partial<Event>) => void;
}

export const EventEditTab: React.FC<EventEditTabProps> = ({
  event,
  collaboration,
  onEventUpdate
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Event Details</h3>
        <EventForm
          initialValues={event}
          onSubmit={onEventUpdate}
          isExistingEvent={true}
        />
      </div>
    </div>
  );
}; 