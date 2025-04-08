import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import { Event } from '../types';
import { format } from 'date-fns';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch user's events
  useEffect(() => {
    const fetchEvents = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        const fetchedEvents = await eventService.getAllEvents(isAuthenticated);
        setEvents(fetchedEvents);
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [isAuthenticated]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Starting logout process from profile page');
      await logout();
      console.log('Logout successful, navigating to home page');
      navigate('/');
    } catch (error) {
      console.error('Logout error in UserProfile:', error);
      // Still try to navigate to home page even if there was an error
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const handleDeleteData = async () => {
    if (window.confirm('Are you sure you want to delete all your event data? This cannot be undone.')) {
      try {
        await eventService.deleteEvent(isAuthenticated);
        setEvents([]);
        alert('All event data deleted successfully.');
        navigate('/');
      } catch (error) {
        console.error('Error deleting event data', error);
        alert('Failed to delete event data. Please try again.');
      }
    }
  };
  
  const handleCreateNewEvent = () => {
    // Clear any existing event in localStorage first
    localStorage.removeItem('event');
    localStorage.removeItem('eventStep');
    localStorage.removeItem('activeCategory');
    // Navigate to create page
    navigate('/create');
  };
  
  const handleEditEvent = (eventId: string | undefined) => {
    if (eventId) {
      // Navigate to edit page with the event ID
      navigate(`/create?eventId=${eventId}`);
    }
  };
  
  const handleDeleteEvent = async (eventId: string | undefined, eventName: string) => {
    if (!eventId) return;
    
    if (window.confirm(`Are you sure you want to delete "${eventName}"? This cannot be undone.`)) {
      try {
        const success = await eventService.deleteEventById(eventId, isAuthenticated);
        if (success) {
          // Remove event from local state
          setEvents(events.filter(event => event.id !== eventId));
          alert('Event deleted successfully.');
        } else {
          alert('Failed to delete event. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting event', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-fun p-8 mb-8">
        <h1 className="text-3xl font-display text-primary-600 mb-6">
          Your Account
        </h1>
        
        <div className="bg-primary-50 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mr-4">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-800">
                {user?.name || 'User'}
              </h2>
              <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-heading font-semibold text-gray-800 mb-2">
                Account Information
              </h3>
              <p className="text-gray-600 text-sm mb-1">
                <span className="font-medium">Email: </span>
                {user?.email}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Member since: </span>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </p>
              <button className="mt-4 text-sm text-primary-600 hover:text-primary-800">
                Change Password
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h3 className="font-heading font-semibold text-gray-800 mb-2">
                Account Options
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handleDeleteData}
                  className="text-sm text-red-600 hover:text-red-800 block"
                >
                  Delete All Event Data
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`text-sm text-red-600 hover:text-red-800 block ${
                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-heading font-bold text-gray-800">
              Your Events
            </h2>
            <button
              onClick={handleCreateNewEvent}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm"
            >
              Create New Event
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-4">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-heading font-semibold text-gray-800">
                      {event.name || 'Unnamed Event'}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                      <p>
                        <span className="font-medium">Date: </span>
                        {formatDate(event.date)}
                      </p>
                      <p>
                        <span className="font-medium">Guests: </span>
                        {event.guestCount}
                      </p>
                      <p>
                        <span className="font-medium">Type: </span>
                        {event.eventType}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEvent(event.id)}
                      className="px-3 py-1 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg transition-colors shadow-sm text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.name)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="font-heading text-lg text-gray-700 mb-2">
                No Events Yet
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't created any events yet. Start planning your first event!
              </p>
              <button
                onClick={handleCreateNewEvent}
                className="py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm"
              >
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 