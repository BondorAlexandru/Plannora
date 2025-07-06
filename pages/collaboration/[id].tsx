import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../../src/components/NextLayout';
import { useAuth } from '../../src/contexts/NextAuthContext';
import ChatInterface from '../../src/components/ChatInterface';
import VendorManagement from '../../src/components/VendorManagement';

interface Collaboration {
  _id: string;
  clientId: string;
  plannerId: string;
  eventId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt?: string;
  clientName: string;
  plannerName: string;
  plannerBusinessName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  budget?: number;
  isClient?: boolean;
}



interface VendorNote {
  _id: string;
  collaborationId: string;
  eventId: string;
  providerId: string;
  authorId: string;
  note: string;
  rating?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorName: string;
  isCurrentUser: boolean;
}

const CollaborationPage: React.FC = () => {
  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [vendorNotes, setVendorNotes] = useState<VendorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'vendors'>('chat');
  const [newNote, setNewNote] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  const [archiving, setArchiving] = useState(false);
  
  const { user, getToken } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  // Fetch collaboration data
  useEffect(() => {
    const fetchCollaboration = async () => {
      if (!id || !user) return;
      
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/collaborations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch collaboration');
        }
        
        const data = await response.json();
        setCollaboration(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch collaboration');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaboration();
  }, [id, user, getToken]);



  // Fetch vendor notes
  useEffect(() => {
    const fetchVendorNotes = async () => {
      if (!id || !user) return;
      
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/collaborations/${id}/vendor-notes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch vendor notes');
        }
        
        const data = await response.json();
        setVendorNotes(data);
      } catch (err) {
        console.error('Error fetching vendor notes:', err);
      }
    };

    if (collaboration) {
      fetchVendorNotes();
    }
  }, [id, user, collaboration, getToken]);



  const handleAddNote = async () => {
    if (!newNote.trim() || !id || !user) return;
    
    setAddingNote(true);
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${id}/vendor-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId: 'general', // For general notes
          note: newNote.trim(),
          rating: selectedRating,
          tags: selectedTags
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      
      const newVendorNote = await response.json();
      setVendorNotes(prev => [newVendorNote, ...prev]);
      setNewNote('');
      setSelectedRating(null);
      setSelectedTags([]);
    } catch (err) {
      console.error('Error adding note:', err);
      alert(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const availableTags = [
    'Important',
    'Follow-up',
    'Confirmed',
    'Pending',
    'Cancelled',
    'Backup Option',
    'Preferred',
    'Budget-friendly',
    'Premium',
    'Recommended'
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Archive/unarchive collaboration
  const handleArchiveToggle = async () => {
    if (!collaboration || !user) return;
    
    try {
      setArchiving(true);
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const archived = collaboration.status === 'active';
      
      const response = await fetch(`${baseUrl}/api/collaborations/${id}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ archived })
      });
      
      if (response.ok) {
        setCollaboration(prev => prev ? {
          ...prev,
          status: archived ? 'archived' : 'active',
          updatedAt: new Date().toISOString()
        } : null);
      } else {
        console.error('Failed to archive collaboration');
        alert('Failed to archive collaboration');
      }
    } catch (error) {
      console.error('Error archiving collaboration:', error);
      alert('Error archiving collaboration');
    } finally {
      setArchiving(false);
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {collaboration.eventName}
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
                onClick={handleArchiveToggle}
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
            <span>📅 {collaboration.eventDate}</span>
            <span>📍 {collaboration.eventLocation}</span>
            <span>👥 {collaboration.clientName} & {collaboration.plannerBusinessName}</span>
            {collaboration.budget && (
              <span>💰 ${collaboration.budget.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('chat')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vendor Notes ({vendorNotes.length})
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vendors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vendor Management
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'chat' && (
          <ChatInterface
            collaborationId={collaboration._id}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorManagement
            collaborationId={collaboration._id}
            eventId={collaboration.eventId}
            userBudget={collaboration.budget || 10000}
          />
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Add Note Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Vendor Note</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                    placeholder="Add your note about a vendor or general planning note..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (optional)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={`w-8 h-8 rounded-full ${
                          selectedRating === rating
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedRating(null)}
                      className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>
            </div>

            {/* Vendor Notes List */}
            <div className="space-y-4">
              {vendorNotes.map(note => (
                <div
                  key={note._id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {note.authorName}
                      </span>
                      {note.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600">{note.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{note.note}</p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {vendorNotes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No vendor notes yet</p>
                  <p className="text-sm mt-1">Add your first note above!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    } />
  );
};

export default CollaborationPage; 