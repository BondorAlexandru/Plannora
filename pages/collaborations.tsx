import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '../src/components/NextLayout';
import { useAuth } from '../src/contexts/NextAuthContext';

interface Collaboration {
  _id: string;
  clientId: string;
  plannerId: string;
  eventId: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  clientName: string;
  plannerName: string;
  plannerBusinessName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
}

const CollaborationsPage: React.FC = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, getToken } = useAuth();
  
  // Fetch collaborations
  useEffect(() => {
    const fetchCollaborations = async () => {
      if (!user) return;
      
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/collaborations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch collaborations');
        }
        
        const data = await response.json();
        setCollaborations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch collaborations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollaborations();
  }, [user, getToken]);
  
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
  
  if (error) {
    return (
      <Layout children={
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Error: {error}
          </div>
        </div>
      } />
    );
  }
  
  return (
    <Layout children={
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            My Collaborations
          </h1>
          <p className="text-gray-600">
            Active collaborations where you're working together on events.
          </p>
        </div>
        
        {/* Collaborations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.map((collaboration) => (
            <div key={collaboration._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {collaboration.eventName}
                  </h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-4 h-4 mr-2">📅</span>
                    <span>{collaboration.eventDate}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-4 h-4 mr-2">📍</span>
                    <span className="truncate">{collaboration.eventLocation}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <p className="text-gray-600">Collaborating with:</p>
                      <p className="font-medium text-gray-900">
                        {user.accountType === 'client' 
                          ? collaboration.plannerBusinessName || collaboration.plannerName
                          : collaboration.clientName
                        }
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/collaboration/${collaboration._id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                  >
                    Open Collaboration
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {collaborations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg mb-2">No active collaborations</p>
              <p className="text-sm">
                {user.accountType === 'client' 
                  ? "When you match with a planner, your collaborations will appear here."
                  : "When you accept match requests, your collaborations will appear here."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    } />
  );
};

export default CollaborationsPage; 