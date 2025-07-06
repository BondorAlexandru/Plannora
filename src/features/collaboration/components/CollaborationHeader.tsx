import React from 'react';
import Link from 'next/link';
import { Collaboration } from '../types';
import { Event } from '../../../types';

interface CollaborationHeaderProps {
  collaboration: Collaboration;
  event: Event | null;
  archiving: boolean;
  onArchiveToggle: () => void;
}

export const CollaborationHeader: React.FC<CollaborationHeaderProps> = ({
  collaboration,
  event,
  archiving,
  onArchiveToggle
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-gray-900">
            {event?.name || collaboration.eventName}
          </h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            collaboration.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {collaboration.status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/collaborations"
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Collaborations
          </Link>
          <button
            onClick={onArchiveToggle}
            disabled={archiving}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              collaboration.status === 'active'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${archiving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {archiving ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                <span>...</span>
              </div>
            ) : (
              collaboration.status === 'active' ? 'Archive' : 'Unarchive'
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>📅 {event?.date || collaboration.eventDate}</span>
        <span>📍 {event?.location || collaboration.eventLocation}</span>
        <span>👥 {collaboration.clientName} & {collaboration.plannerBusinessName}</span>
        <span>🎉 {event?.eventType || 'Event'}</span>
        <span>👤 {event?.guestCount || 'TBD'} guests</span>
        {(event?.budget || collaboration.budget) && (
          <span>💰 ${(event?.budget || collaboration.budget)?.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}; 