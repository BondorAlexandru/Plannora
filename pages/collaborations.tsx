import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../src/components/NextLayout';
import { useAuth } from '../src/contexts/NextAuthContext';

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
  budget: number;
  isClient: boolean;
}

type FilterStatus = 'all' | 'active' | 'archived';

const CollaborationsPage: React.FC = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [archiving, setArchiving] = useState<string | null>(null);
  
  const { user, getToken } = useAuth();
  const router = useRouter();

  // Fetch collaborations
  const fetchCollaborations = async (status: FilterStatus = 'all') => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const response = await fetch(`${baseUrl}/api/collaborations?status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCollaborations(data);
      } else {
        console.error('Failed to fetch collaborations');
      }
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Archive/unarchive collaboration
  const handleArchiveToggle = async (collaborationId: string, currentStatus: string) => {
    if (!user) return;
    
    try {
      setArchiving(collaborationId);
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const archived = currentStatus === 'active';
      
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/archive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ archived })
      });
      
      if (response.ok) {
        // Refresh collaborations list
        await fetchCollaborations(filterStatus);
      } else {
        console.error('Failed to archive collaboration');
      }
    } catch (error) {
      console.error('Error archiving collaboration:', error);
    } finally {
      setArchiving(null);
    }
  };

  // Handle filter change
  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    fetchCollaborations(status);
  };

  // Load collaborations on mount
  useEffect(() => {
    fetchCollaborations(filterStatus);
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!user) {
    return <Layout children={<div>Please log in to view collaborations.</div>} />;
  }

  return (
    <Layout children={
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Collaborations</h1>
          <p className="text-gray-600">Manage your event planning collaborations</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['all', 'active', 'archived'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    filterStatus === status
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status}
                  {status !== 'all' && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {collaborations.filter(c => c.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Collaborations List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {collaborations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No collaborations found</h3>
                <p className="text-gray-500">
                  {filterStatus === 'all' 
                    ? "You don't have any collaborations yet."
                    : `No ${filterStatus} collaborations found.`
                  }
                </p>
              </div>
            ) : (
              collaborations.map((collaboration) => (
                <div
                  key={collaboration._id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {collaboration.eventName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collaboration.status)}`}>
                          {collaboration.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-4">
                          <span>📅 {formatDate(collaboration.eventDate)}</span>
                          <span>📍 {collaboration.eventLocation}</span>
                          {collaboration.budget > 0 && (
                            <span>💰 ${collaboration.budget.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>👥</span>
                          <span className="font-medium">
                            {collaboration.isClient ? 'You' : collaboration.clientName}
                          </span>
                          <span>+</span>
                          <span className="font-medium">
                            {collaboration.isClient ? collaboration.plannerBusinessName || collaboration.plannerName : 'You'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created {formatDate(collaboration.createdAt)}
                        {collaboration.updatedAt && (
                          <span> • Updated {formatDate(collaboration.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => router.push(`/collaboration/${collaboration._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Open
                      </button>
                      
                      <button
                        onClick={() => handleArchiveToggle(collaboration._id, collaboration.status)}
                        disabled={archiving === collaboration._id}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          collaboration.status === 'active'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } ${archiving === collaboration._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {archiving === collaboration._id ? (
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
                </div>
              ))
            )}
          </div>
        )}
      </div>
    } />
  );
};

export default CollaborationsPage; 