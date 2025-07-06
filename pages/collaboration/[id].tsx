import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../../src/components/NextLayout';
import { useAuth } from '../../src/contexts/NextAuthContext';
import ChatInterface from '../../src/components/ChatInterface';
import ServicesSelection from '../../src/components/ServicesSelection';
import { Event, SelectedProvider } from '../../src/types';
import { Provider, ProviderCategory, providers, Offer } from '../../src/data/mockData';
import EventForm from '../../src/components/EventForm';
import ProviderDetail from '../../src/components/ProviderDetail';
import SearchableDropdown from '../../src/components/SearchableDropdown';

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
  vendorId: string;
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
  const [event, setEvent] = useState<Event | null>(null);
  const [vendorNotes, setVendorNotes] = useState<VendorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'vendors' | 'edit-event'>('chat');
  const [newNote, setNewNote] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [addingNote, setAddingNote] = useState(false);
  const [archiving, setArchiving] = useState(false);
  
  // ServicesSelection state
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<Provider | null>(null);
  
  // Quick note state
  const [highlightVendorSelect, setHighlightVendorSelect] = useState(false);
  
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
        
        // Fetch the full event data
        if (data.eventId) {
          const eventResponse = await fetch(`${baseUrl}/api/events/${data.eventId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (eventResponse.ok) {
            const eventData = await eventResponse.json();
            setEvent(eventData);
            setSelectedProviders(eventData.selectedProviders || []);
          }
        }
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
    if (!newNote.trim() || !selectedVendor || !id || !user) return;
    
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
          vendorId: selectedVendor,
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
      setSelectedVendor('');
      setHighlightVendorSelect(false);
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

  // Group notes by vendor
  const groupedNotes = vendorNotes.reduce((groups, note) => {
    const vendorId = note.vendorId;
    if (!groups[vendorId]) {
      groups[vendorId] = [];
    }
    groups[vendorId].push(note);
    return groups;
  }, {} as Record<string, VendorNote[]>);

  // Get vendor information by ID
  const getVendorInfo = (vendorId: string) => {
    if (vendorId === 'general') {
      return { name: 'General Notes', category: 'General', image: '' };
    }
    const provider = providers.find(p => p.id === vendorId);
    return provider ? { name: provider.name, category: provider.category, image: provider.image } : { name: 'Unknown Vendor', category: 'Unknown', image: '' };
  };

  // Check if vendor is selected in budget
  const isVendorSelected = (providerId: string) => {
    return selectedProviders.some(p => p.id === providerId);
  };

  // ServicesSelection functions
  const handleSelectProvider = async (provider: SelectedProvider) => {
    if (!event) return;
    
    const newSelectedProviders = selectedProviders.find(p => p.id === provider.id)
      ? selectedProviders.filter(p => p.id !== provider.id)
      : [...selectedProviders, provider];
    
    setSelectedProviders(newSelectedProviders);
    
    // Save to backend
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      await fetch(`${baseUrl}/api/events/${event._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...event,
          selectedProviders: newSelectedProviders
        })
      });
    } catch (err) {
      console.error('Error saving provider selection:', err);
    }
  };

  const handleViewProviderDetail = (provider: Provider) => {
    setSelectedProviderDetail(provider);
  };

  const handleSelectOffer = (provider: Provider, offer: Offer) => {
    if (!event) return;
    
    const isPerPerson = provider.category === ProviderCategory.CATERING;
    const price = isPerPerson ? offer.price * event.guestCount : offer.price;
    
    const selectedProvider: SelectedProvider = {
      id: provider.id,
      name: provider.name,
      price: price,
      category: provider.category,
      image: provider.image,
      offerName: offer.name,
      originalPrice: isPerPerson ? offer.price : undefined,
      isPerPerson
    };

    handleSelectProvider(selectedProvider);
    setSelectedProviderDetail(null); // Close modal after selection
  };

  const calculateTotal = () => {
    return selectedProviders.reduce((total, provider) => total + provider.price, 0);
  };

  const budget = event?.budget || collaboration?.budget || 10000;
  const currentTotal = calculateTotal();
  const percentUsed = budget > 0 ? (currentTotal / budget) * 100 : 0;
  const budgetRemaining = budget - currentTotal;
  const isOverBudget = budget > 0 && currentTotal > budget;

  // Handle event editing
  const handleEditEvent = async (updatedEvent: Partial<Event>) => {
    if (!event || !user) return;
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      
      // Update the event with all fields
      const response = await fetch(`${baseUrl}/api/events/${event._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...event,
          ...updatedEvent
        })
      });
      
      if (response.ok) {
        const updatedEventData = await response.json();
        setEvent(updatedEventData);
        
        // Update local collaboration state if needed
        if (collaboration) {
          setCollaboration(prev => prev ? {
            ...prev,
            eventName: updatedEvent.name || prev.eventName,
            eventDate: updatedEvent.date || prev.eventDate,
            eventLocation: updatedEvent.location || prev.eventLocation,
            budget: updatedEvent.budget || prev.budget
          } : null);
        }
        
        alert('Event details updated successfully!');
        setActiveTab('chat'); // Return to chat after saving
      } else {
        throw new Error('Failed to update event details');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      alert(err instanceof Error ? err.message : 'Failed to update event details');
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Quick note handlers
  const handleQuickNote = (providerId: string, providerName: string) => {
    setSelectedVendor(providerId);
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



  // Calculate vendor notes count
  const vendorNotesCount = vendorNotes.reduce((counts, note) => {
    counts[note.vendorId] = (counts[note.vendorId] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

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
              <button
                onClick={() => setActiveTab('edit-event')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit-event'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Edit Event
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

        {activeTab === 'vendors' && event && (
          <ServicesSelection
            event={event}
            providers={providers}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            handleSelectProvider={handleSelectProvider}
            handleViewProviderDetail={handleViewProviderDetail}
            calculateTotal={calculateTotal}
            percentUsed={percentUsed}
            budgetRemaining={budgetRemaining}
            isOverBudget={isOverBudget}
            setStep={() => {}}
            handleSubmit={() => {}}
            budgetImpact={null}
            showBudgetAlert={false}
            budgetSuggestions={[]}
            onQuickNote={handleQuickNote}
            vendorNotes={vendorNotesCount}
          />
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Add Note Form */}
            <div className={`bg-white rounded-lg border p-6 transition-all duration-300 ${
              highlightVendorSelect 
                ? 'border-blue-300 ring-2 ring-blue-100 shadow-md' 
                : 'border-gray-200'
            }`}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Vendor Note</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendor
                  </label>
                  <SearchableDropdown
                    options={[
                      { value: '', label: 'Choose a vendor...', description: '' },
                      { value: 'general', label: 'General Notes', description: 'Notes not specific to any vendor' },
                      ...providers.map(provider => ({
                        value: provider.id,
                        label: provider.name,
                        description: `${provider.category}${isVendorSelected(provider.id) ? ' ✓ Selected' : ''}`
                      }))
                    ]}
                    value={selectedVendor}
                    onChange={(value) => {
                      setSelectedVendor(value);
                      setHighlightVendorSelect(false);
                    }}
                    placeholder="Search for a vendor..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setNewNote(e.target.value);
                      setHighlightVendorSelect(false);
                    }}
                    placeholder="Add your note about this vendor..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                      highlightVendorSelect 
                        ? 'border-blue-300 ring-1 ring-blue-100' 
                        : 'border-gray-300'
                    }`}
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
                    disabled={!newNote.trim() || !selectedVendor || addingNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>
            </div>

            {/* Vendor Notes by Vendor */}
            <div className="space-y-6">
              {/* Selected Vendors First */}
              {selectedProviders.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Vendors</h3>
                  {selectedProviders.map(selectedProvider => {
                    const vendorNotes = groupedNotes[selectedProvider.id] || [];
                    const vendorInfo = getVendorInfo(selectedProvider.id);
                    return (
                      <div key={selectedProvider.id} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {vendorInfo.image && (
                              <img src={vendorInfo.image} alt={vendorInfo.name} className="w-12 h-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{vendorInfo.name}</h4>
                              <p className="text-sm text-gray-600">{vendorInfo.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              ✓ Selected - ${selectedProvider.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {vendorNotes.length} note{vendorNotes.length !== 1 ? 's' : ''}
                            </span>
                            {/* Plus icon for adding notes */}
                            <button
                              onClick={() => handleQuickNote(selectedProvider.id, selectedProvider.name)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors"
                              title="Add note"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {vendorNotes.length > 0 && (
                          <div className="space-y-3">
                            {vendorNotes.map(note => (
                              <div key={note._id} className="bg-white rounded-lg p-3 border border-green-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">{note.authorName}</span>
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
                                <p className="text-gray-700 mb-2">{note.note}</p>
                                {note.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {note.tags.map(tag => (
                                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Other Vendors with Notes */}
              {Object.keys(groupedNotes).filter(vendorId => 
                !selectedProviders.some(sp => sp.id === vendorId)
              ).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Other Vendors</h3>
                  {Object.entries(groupedNotes)
                    .filter(([vendorId]) => !selectedProviders.some(sp => sp.id === vendorId))
                    .map(([vendorId, notes]) => {
                      const vendorInfo = getVendorInfo(vendorId);
                      return (
                                                 <div key={vendorId} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {vendorInfo.image && (
                                <img src={vendorInfo.image} alt={vendorInfo.name} className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div>
                                <h4 className="font-medium text-gray-900">{vendorInfo.name}</h4>
                                <p className="text-sm text-gray-600">{vendorInfo.category}</p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {notes.length} note{notes.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {notes.map(note => (
                              <div key={note._id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">{note.authorName}</span>
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
                                <p className="text-gray-700 mb-2">{note.note}</p>
                                {note.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {note.tags.map(tag => (
                                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {Object.keys(groupedNotes).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No vendor notes yet</p>
                  <p className="text-sm mt-1">Add your first note above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'edit-event' && event && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Event Details</h3>
              <EventForm
                initialValues={event}
                onSubmit={handleEditEvent}
                isExistingEvent={true}
              />
            </div>
          </div>
        )}

        {/* Provider Detail Modal */}
        {selectedProviderDetail && event && (
          <ProviderDetail
            provider={selectedProviderDetail}
            onClose={() => setSelectedProviderDetail(null)}
            onSelectOffer={handleSelectOffer}
            guestCount={event.guestCount}
            isPerPerson={selectedProviderDetail.category === ProviderCategory.CATERING}
            selectedOfferId={selectedProviders.find(p => p.id === selectedProviderDetail.id)?.offerName}
          />
        )}
      </div>
    } />
  );
};

export default CollaborationPage; 