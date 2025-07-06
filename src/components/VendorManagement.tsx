import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/NextAuthContext';
import BudgetInsights, { BudgetImpact, BudgetSuggestion } from './BudgetInsights';

interface Vendor {
  _id: string;
  name: string;
  category: string;
  email?: string;
  phone?: string;
  website?: string;
  rating: number;
  priceRange: string;
  location: string;
  services: string[];
  description: string;
  isVerified: boolean;
  images: string[];
  createdAt: string;
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

interface CollaborationVendor {
  _id: string;
  vendorId: string;
  addedBy: string;
  addedByName: string;
  addedAt: string;
  status: 'considering' | 'contacted' | 'booked' | 'declined';
  vendor: Vendor;
  notes: VendorNote[];
}

interface VendorManagementProps {
  collaborationId: string;
  eventId: string;
  userBudget?: number;
}

const VendorManagement: React.FC<VendorManagementProps> = ({ collaborationId, eventId, userBudget = 0 }) => {
  const [collaborationVendors, setCollaborationVendors] = useState<CollaborationVendor[]>([]);
  const [availableVendors, setAvailableVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<CollaborationVendor | null>(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newRating, setNewRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [addingNote, setAddingNote] = useState(false);
  
  // Budget tracking state
  const [budgetImpact, setBudgetImpact] = useState<BudgetImpact | null>(null);
  const [budgetSuggestions, setBudgetSuggestions] = useState<BudgetSuggestion[]>([]);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  
  const { user, getToken } = useAuth();

  const categories = [
    'all', 'catering', 'photography', 'videography', 'music', 'flowers', 
    'decoration', 'venue', 'transportation', 'entertainment', 'other'
  ];

  const availableTags = [
    'Preferred', 'Backup Option', 'Budget-friendly', 'Premium', 'Recommended',
    'Contacted', 'Responded', 'Quote Received', 'Booking Confirmed', 'Deposit Paid',
    'Follow-up Needed', 'Not Available', 'Too Expensive', 'Excellent Service',
    'Needs Improvement', 'Highly Rated', 'Local Vendor', 'Emergency Contact'
  ];

  // Budget calculations
  const calculateTotal = () => {
    return collaborationVendors
      .filter(cv => cv.status === 'booked')
      .reduce((total, cv) => {
        // Parse price range to get average price
        const priceRange = cv.vendor.priceRange;
        const priceNumbers = priceRange.match(/\d+/g);
        if (priceNumbers && priceNumbers.length >= 2) {
          const minPrice = parseInt(priceNumbers[0]);
          const maxPrice = parseInt(priceNumbers[1]);
          return total + (minPrice + maxPrice) / 2;
        }
        return total + 1000; // Default fallback price
      }, 0);
  };

  const currentTotal = calculateTotal();
  const budgetRemaining = userBudget - currentTotal;
  const percentUsed = userBudget > 0 ? (currentTotal / userBudget) * 100 : 0;
  const isOverBudget = userBudget > 0 && currentTotal > userBudget;

  // Generate budget suggestions
  const generateBudgetSuggestions = () => {
    const suggestions: BudgetSuggestion[] = [];
    const bookedCategories = new Set(
      collaborationVendors
        .filter(cv => cv.status === 'booked')
        .map(cv => cv.vendor.category)
    );

    // Suggest categories that are missing
    const missingCategories = categories.filter(cat => 
      cat !== 'all' && !bookedCategories.has(cat)
    );

    missingCategories.forEach(category => {
      const categoryVendors = availableVendors.filter(v => v.category === category);
      if (categoryVendors.length > 0) {
        const minPrice = Math.min(...categoryVendors.map(v => {
          const priceNumbers = v.priceRange.match(/\d+/g);
          return priceNumbers ? parseInt(priceNumbers[0]) : 1000;
        }));

        suggestions.push({
          category,
          suggestion: `Consider adding ${category} vendors to complete your event`,
          minPrice,
          action: () => setSelectedCategory(category)
        });
      }
    });

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  // Fetch collaboration vendors
  useEffect(() => {
    const fetchCollaborationVendors = async () => {
      if (!collaborationId || !user) return;
      
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendors`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCollaborationVendors(data);
        }
      } catch (error) {
        console.error('Error fetching collaboration vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborationVendors();
  }, [collaborationId, user, getToken]);

  // Fetch available vendors when adding
  useEffect(() => {
    const fetchAvailableVendors = async () => {
      if (!showAddVendor || !user) return;
      
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/vendors`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableVendors(data);
        }
      } catch (error) {
        console.error('Error fetching available vendors:', error);
      }
    };

    fetchAvailableVendors();
  }, [showAddVendor, user, getToken]);

  // Update budget suggestions when data changes
  useEffect(() => {
    if (userBudget > 0) {
      setBudgetSuggestions(generateBudgetSuggestions());
      setShowBudgetAlert(percentUsed > 80 && !isOverBudget);
    }
  }, [collaborationVendors, availableVendors, userBudget, percentUsed, isOverBudget]);

  const handleAddVendor = async (vendorId: string) => {
    if (!collaborationId || !user) return;
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vendorId })
      });
      
      if (response.ok) {
        const newCollaborationVendor = await response.json();
        setCollaborationVendors(prev => [...prev, newCollaborationVendor]);
        setShowAddVendor(false);
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
    }
  };

  const handleRemoveVendor = async (vendorId: string) => {
    if (!collaborationId || !user) return;
    
    if (!confirm('Are you sure you want to remove this vendor from the collaboration?')) {
      return;
    }
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setCollaborationVendors(prev => prev.filter(cv => cv.vendorId !== vendorId));
        if (selectedVendor && selectedVendor.vendorId === vendorId) {
          setSelectedVendor(null);
        }
      }
    } catch (error) {
      console.error('Error removing vendor:', error);
    }
  };

  const handleUpdateVendorStatus = async (vendorId: string, status: CollaborationVendor['status']) => {
    if (!collaborationId || !user) return;
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setCollaborationVendors(prev => prev.map(cv => 
          cv.vendorId === vendorId ? { ...cv, status } : cv
        ));
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  const handleAddNote = async (vendorId: string) => {
    if (!newNote.trim() || !collaborationId || !user) return;
    
    setAddingNote(true);
    
    try {
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/vendor-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorId,
          note: newNote.trim(),
          rating: newRating,
          tags: selectedTags
        })
      });
      
      if (response.ok) {
        const newNoteData = await response.json();
        
        // Update the collaboration vendors with the new note
        setCollaborationVendors(prev => prev.map(cv => 
          cv.vendorId === vendorId 
            ? { ...cv, notes: [newNoteData, ...cv.notes] }
            : cv
        ));
        
        // Update selected vendor if it's the same
        if (selectedVendor && selectedVendor.vendorId === vendorId) {
          setSelectedVendor(prev => prev ? {
            ...prev,
            notes: [newNoteData, ...prev.notes]
          } : null);
        }
        
        // Reset form
        setNewNote('');
        setNewRating(null);
        setSelectedTags([]);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getStatusColor = (status: CollaborationVendor['status']) => {
    switch (status) {
      case 'considering': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'booked': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVendors = collaborationVendors.filter(cv => {
    const matchesSearch = cv.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cv.vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cv.vendor.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || cv.vendor.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredAvailableVendors = availableVendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    
    // Don't show vendors already in collaboration
    const notInCollaboration = !collaborationVendors.find(cv => cv.vendorId === vendor._id);
    
    return matchesSearch && matchesCategory && notInCollaboration;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
          <p className="text-gray-600">{collaborationVendors.length} vendor{collaborationVendors.length !== 1 ? 's' : ''} in this collaboration</p>
        </div>
        <button
          onClick={() => setShowAddVendor(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Vendor
        </button>
      </div>

      {/* Budget Insights */}
      {userBudget > 0 && (
        <BudgetInsights
          budget={userBudget}
          currentTotal={currentTotal}
          percentUsed={percentUsed}
          budgetRemaining={budgetRemaining}
          isOverBudget={isOverBudget}
          budgetImpact={budgetImpact}
          showBudgetAlert={showBudgetAlert}
          budgetSuggestions={budgetSuggestions}
          title="Vendor Budget Tracking"
          className="sticky top-4 z-10"
        />
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map(collaborationVendor => (
          <div
            key={collaborationVendor._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {collaborationVendor.vendor.name}
                </h3>
                <p className="text-gray-600 capitalize mb-2">{collaborationVendor.vendor.category}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">
                      {collaborationVendor.vendor.rating}/5
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{collaborationVendor.vendor.priceRange}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collaborationVendor.status)}`}>
                  {collaborationVendor.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedVendor(collaborationVendor)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="View Details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleRemoveVendor(collaborationVendor.vendorId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove Vendor"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(['considering', 'contacted', 'booked', 'declined'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => handleUpdateVendorStatus(collaborationVendor.vendorId, status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    collaborationVendor.status === status
                      ? getStatusColor(status)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-1 mb-4">
              {collaborationVendor.vendor.services.slice(0, 3).map(service => (
                <span key={service} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                  {service}
                </span>
              ))}
              {collaborationVendor.vendor.services.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{collaborationVendor.vendor.services.length - 3} more
                </span>
              )}
            </div>

            {/* Notes Preview */}
            {collaborationVendor.notes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Notes ({collaborationVendor.notes.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {collaborationVendor.notes.slice(0, 2).map(note => (
                    <div key={note._id} className="text-sm">
                      <p className="text-gray-700 truncate">{note.note}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{note.authorName}</span>
                        {note.rating && (
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-xs text-gray-500 ml-1">{note.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {collaborationVendor.notes.length > 2 && (
                    <button
                      onClick={() => setSelectedVendor(collaborationVendor)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View all {collaborationVendor.notes.length} notes
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V9a2 2 0 00-2-2H10a2 2 0 00-2 2v3.1M15 13l-3-3-3 3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-600 mb-4">
            {collaborationVendors.length === 0 
              ? "Add your first vendor to get started!"
              : "Try adjusting your search or filters."
            }
          </p>
          <button
            onClick={() => setShowAddVendor(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Vendor
          </button>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Vendor</h3>
                <button
                  onClick={() => setShowAddVendor(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search and Filter for Add Modal */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search available vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Available Vendors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredAvailableVendors.map(vendor => (
                  <div
                    key={vendor._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{vendor.name}</h4>
                        <p className="text-sm text-gray-600 capitalize mb-2">{vendor.category}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600 ml-1">{vendor.rating}/5</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">{vendor.priceRange}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddVendor(vendor._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vendor.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {vendor.services.slice(0, 3).map(service => (
                        <span key={service} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {service}
                        </span>
                      ))}
                      {vendor.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{vendor.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredAvailableVendors.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No available vendors found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{selectedVendor.vendor.name}</h3>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vendor Info */}
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Vendor Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Category:</span> {selectedVendor.vendor.category}</p>
                      <p><span className="font-medium">Rating:</span> {selectedVendor.vendor.rating}/5 ★</p>
                      <p><span className="font-medium">Price Range:</span> {selectedVendor.vendor.priceRange}</p>
                      <p><span className="font-medium">Location:</span> {selectedVendor.vendor.location}</p>
                      {selectedVendor.vendor.email && (
                        <p><span className="font-medium">Email:</span> {selectedVendor.vendor.email}</p>
                      )}
                      {selectedVendor.vendor.phone && (
                        <p><span className="font-medium">Phone:</span> {selectedVendor.vendor.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {(['considering', 'contacted', 'booked', 'declined'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateVendorStatus(selectedVendor.vendorId, status)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedVendor.status === status
                              ? getStatusColor(status)
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.vendor.services.map(service => (
                        <span key={service} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Notes</h4>
                  
                  {/* Add Note Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="space-y-4">
                      <div>
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note about this vendor..."
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
                              onClick={() => setNewRating(rating)}
                              className={`w-8 h-8 rounded-full ${
                                newRating === rating
                                  ? 'bg-yellow-400 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          <button
                            onClick={() => setNewRating(null)}
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
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                          {availableTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleTagToggle(tag)}
                              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
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
                          onClick={() => handleAddNote(selectedVendor.vendorId)}
                          disabled={!newNote.trim() || addingNote}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingNote ? 'Adding...' : 'Add Note'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {selectedVendor.notes.map(note => (
                      <div key={note._id} className="bg-white border border-gray-200 rounded-lg p-4">
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
                    
                    {selectedVendor.notes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No notes yet</p>
                        <p className="text-sm mt-1">Add your first note above!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement; 