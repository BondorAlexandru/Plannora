import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../src/components/NextLayout';
import { useAuth } from '../../src/contexts/NextAuthContext';
import ChatInterface from '../../src/components/ChatInterface';
import { providers } from '../../src/data/mockData';
import {
  CollaborationTab,
  useCollaboration,
  useVendorNotes,
  useEventEdit,
  CollaborationHeader,
  CollaborationTabs,
  VendorNotesTab,
  VendorManagementTab,
  EventEditTab
} from '../../src/features/collaboration';

const CollaborationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CollaborationTab>('chat');
  const [highlightVendorSelect, setHighlightVendorSelect] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const {
    collaboration,
    event,
    selectedProviders,
    setSelectedProviders,
    loading,
    error,
    archiving,
    handleArchiveToggle,
    setCollaboration,
    setEvent
  } = useCollaboration(id);

  const { vendorNotesCount } = useVendorNotes(id, collaboration);
  const { handleEditEvent } = useEventEdit(event, collaboration, setEvent, setCollaboration);

  const handleQuickNote = (providerId: string, providerName: string) => {
    setHighlightVendorSelect(true);
    setActiveTab('notes');
    // Focus on the note textarea after a short delay
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder="Add your note about this vendor..."]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  const handleEventEdit = async (updatedEvent: Partial<any>) => {
    const success = await handleEditEvent(updatedEvent);
    if (success) {
      setActiveTab('chat'); // Return to chat after saving
    }
  };

  if (!user) {
    return <Layout children={<div>Loading...</div>} />;
  }

  if (loading) {
    return (
      <Layout children={
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      } />
    );
  }

  if (error || !collaboration) {
    return (
      <Layout children={
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Error: {error || 'Collaboration not found'}
          </div>
        </div>
      } />
    );
  }

  return (
    <Layout children={
      <div className="max-w-6xl mx-auto p-6">
        <CollaborationHeader
          collaboration={collaboration}
          event={event}
          archiving={archiving}
          onArchiveToggle={handleArchiveToggle}
        />

        <CollaborationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          vendorNotesCount={Object.values(vendorNotesCount).reduce((sum, count) => sum + count, 0)}
        />

        {/* Content */}
        {activeTab === 'chat' && (
          <ChatInterface
            collaborationId={collaboration._id}
          />
        )}

        {activeTab === 'vendors' && event && (
          <VendorManagementTab
            event={event}
            providers={providers}
            selectedProviders={selectedProviders}
            setSelectedProviders={setSelectedProviders}
            onQuickNote={handleQuickNote}
            vendorNotesCount={vendorNotesCount}
          />
        )}

        {activeTab === 'notes' && (
          <VendorNotesTab
            collaborationId={collaboration._id}
            collaboration={collaboration}
            selectedProviders={selectedProviders}
            onQuickNote={handleQuickNote}
            highlightVendorSelect={highlightVendorSelect}
          />
        )}

        {activeTab === 'edit-event' && event && (
          <EventEditTab
            event={event}
            collaboration={collaboration}
            onEventUpdate={handleEventEdit}
          />
        )}
      </div>
    } />
  );
};

export default CollaborationPage; 