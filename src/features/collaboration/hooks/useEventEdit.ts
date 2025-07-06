import { useAuth } from '../../../contexts/NextAuthContext';
import { Event } from '../../../types';
import { Collaboration } from '../types';

export const useEventEdit = (
  event: Event | null,
  collaboration: Collaboration | null,
  setEvent: (event: Event) => void,
  setCollaboration: (collaboration: Collaboration) => void
) => {
  const { user, getToken } = useAuth();

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
          setCollaboration({
            ...collaboration,
            eventName: updatedEvent.name || collaboration.eventName,
            eventDate: updatedEvent.date || collaboration.eventDate,
            eventLocation: updatedEvent.location || collaboration.eventLocation,
            budget: updatedEvent.budget || collaboration.budget
          });
        }
        
        alert('Event details updated successfully!');
        return true;
      } else {
        throw new Error('Failed to update event details');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update event details');
      return false;
    }
  };

  return {
    handleEditEvent
  };
}; 