import React from 'react';
import { CollaborationTab } from '../types';

interface CollaborationTabsProps {
  activeTab: CollaborationTab;
  onTabChange: (tab: CollaborationTab) => void;
  vendorNotesCount: number;
}

export const CollaborationTabs: React.FC<CollaborationTabsProps> = ({
  activeTab,
  onTabChange,
  vendorNotesCount
}) => {
  const tabs = [
    { id: 'chat' as const, label: 'Chat' },
    { id: 'notes' as const, label: `Vendor Notes (${vendorNotesCount})` },
    { id: 'vendors' as const, label: 'Vendor Management' },
    { id: 'edit-event' as const, label: 'Edit Event' }
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}; 