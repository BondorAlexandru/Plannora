import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/NextAuthContext';
import { Event, SelectedProvider } from '../../../types';
import { Collaboration } from '../types';

export const useCollaboration = (collaborationId: string | string[] | undefined) => {
  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  const { user, getToken } = useAuth();

  // Fetch collaboration data
  useEffect(() => {
    const fetchCollaboration = async () => {
      if (!collaborationId || !user) return;
      
      try {
        const token = await getToken();
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
        const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}`, {
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
  }, [collaborationId, user, getToken]);

  // Archive/unarchive collaboration
  const handleArchiveToggle = async () => {
    if (!collaboration || !user) return;
    
    try {
      setArchiving(true);
      const token = await getToken();
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
      const archived = collaboration.status === 'active';
      
      const response = await fetch(`${baseUrl}/api/collaborations/${collaborationId}/archive`, {
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

  return {
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
  };
}; 