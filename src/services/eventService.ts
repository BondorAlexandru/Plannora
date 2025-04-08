import axios from 'axios';
import { Event } from '../types';

// Define the base URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Configure axios defaults for cookies
axios.defaults.withCredentials = true;

// For debugging
console.log('EventService using API URL:', API_URL);

// Helper function to ensure auth token is set
const ensureAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
  }
  return false;
};

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Get all events from server (only works when authenticated)
export const getAllEvents = async (isAuthenticated: boolean): Promise<Event[]> => {
  if (!isAuthenticated) {
    return [];
  }
  
  ensureAuthToken();
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
};

// Get events for step 1 selection
export const getEventsForStep1 = async (isAuthenticated: boolean): Promise<Event[]> => {
  if (!isAuthenticated) {
    return [];
  }
  
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events for step 1:', error);
    return [];
  }
};

// Get event by ID from server
export const getEventById = async (eventId: string, isAuthenticated: boolean): Promise<Event | null> => {
  try {
    // For authenticated users, try the API first
    if (isAuthenticated) {
      try {
        const response = await axios.get(`${API_URL}/events/${eventId}`);
        console.log('Event loaded from API successfully:', response.data);
        
        // Save to localStorage for easy access later
        localStorage.setItem('event', JSON.stringify(response.data));
        
        return response.data;
      } catch (apiError) {
        console.error(`API error fetching event with ID ${eventId}:`, apiError);
        // Fall through to try localStorage
      }
    }
    
    // For all users (or as fallback for API errors), check localStorage
    const savedEvent = localStorage.getItem('event');
    if (savedEvent) {
      const parsedEvent = JSON.parse(savedEvent);
      
      // If we have eventId and it matches the localStorage event, return it
      if (parsedEvent && (parsedEvent._id === eventId || parsedEvent.id === eventId)) {
        console.log('Found matching event in localStorage');
        return parsedEvent;
      }
    }
    
    // No event found in API or localStorage
    return null;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    return null;
  }
};

// Get event from server or create a new one if none exists
export const getEvent = async (isAuthenticated: boolean, isGuestMode: boolean, forceFresh: boolean = false): Promise<Event | null> => {
  // If forceFresh is true, return null to create a fresh event
  if (forceFresh) {
    return null;
  }
  
  if (!isAuthenticated || isGuestMode) {
    const storedEvent = localStorage.getItem('event');
    return storedEvent ? JSON.parse(storedEvent) : null;
  }
  
  ensureAuthToken();
  try {
    // First try to get the current event
    console.log('Attempting to get current event');
    let currentEvent = null;
    
    try {
      const currentResponse = await axios.get(`${API_URL}/events/current`);
      if (currentResponse.data) {
        console.log('Found current event:', currentResponse.data);
        return currentResponse.data;
      }
    } catch (error: any) {
      // If there's an error with current event, try getting all events
      console.log('Error getting current event, will check all events instead:', error?.message);
    }
    
    // Then try to get all events
    const response = await axios.get(`${API_URL}/events`);
    
    // If we have events, return the first one
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log('Found existing event:', response.data[0]);
      return response.data[0];
    } else {
      // No events found, create a default one
      console.log('No events found, creating a default event');
      const defaultEvent: Event = {
        name: 'New Event',
        eventType: '',
        date: '',
        time: '',
        location: '',
        budget: 0,
        guestCount: 0,
        step: 1,
        categories: {},
        activeCategory: '',
        selectedProviders: []
      };
      
      return createNewEvent(defaultEvent, isAuthenticated);
    }
  } catch (error: any) {
    console.error('Error fetching events:', error?.message);
    return null;
  }
};

// Save event step to server or localStorage
export const saveEventStep = async (step: number, isAuthenticated: boolean, isGuestMode: boolean, eventId?: string): Promise<void> => {
  if (isAuthenticated && !isGuestMode && eventId) {
    // Save to server
    ensureAuthToken();
    try {
      // Make sure we're sending the correct format the API expects
      const payload = { step: parseInt(step.toString()), eventId };
      console.log('Sending step payload:', payload);
      await axios.patch(`${API_URL}/events/step`, payload);
    } catch (error) {
      console.error('Error saving event step to server:', error);
      // Fallback to localStorage
      localStorage.setItem('eventStep', step.toString());
    }
  } else {
    // Guest mode or not authenticated - save to localStorage only
    localStorage.setItem('eventStep', step.toString());
  }
};

// Create a new event on the server (first-time creation only)
export const createNewEvent = async (event: Event, isAuthenticated: boolean): Promise<Event | null> => {
  if (!isAuthenticated) {
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  }
  
  ensureAuthToken();
  try {
    // Remove any ID fields to ensure we create a new document
    const newEvent = { ...event };
    delete newEvent._id;
    delete newEvent.id;
    
    // Make sure numeric values are actually numbers, not strings
    if (typeof newEvent.guestCount === 'string') {
      newEvent.guestCount = parseInt(newEvent.guestCount);
    }
    if (typeof newEvent.budget === 'string') {
      newEvent.budget = parseFloat(newEvent.budget);
    }
    
    console.log('Creating new event with data:', newEvent);
    
    // Always use /events/new endpoint to ensure a new event is created
    // and not overwriting an existing one with the same name
    const response = await axios.post(`${API_URL}/events/new`, newEvent);
    console.log('New event created response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating new event:', error);
    // Still save to localStorage as a fallback
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  }
};

// Update existing event by ID - only use for events with an ID
export const updateEventById = async (eventId: string, event: Event, isAuthenticated: boolean): Promise<Event | null> => {
  if (!isAuthenticated) {
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  }
  
  // Validate ObjectId format
  if (!isValidObjectId(eventId)) {
    console.error(`Invalid MongoDB ObjectId format: ${eventId}`);
    // Save to localStorage as fallback
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  }
  
  ensureAuthToken();
  
  // Create a copy of the event without ID fields to prevent MongoDB errors
  const eventToUpdate = { ...event };
  delete eventToUpdate._id;
  delete eventToUpdate.id;
  
  // Make sure numeric values are properly numbers
  if (typeof eventToUpdate.guestCount === 'string') {
    eventToUpdate.guestCount = parseInt(eventToUpdate.guestCount);
  }
  if (typeof eventToUpdate.budget === 'string') {
    eventToUpdate.budget = parseFloat(eventToUpdate.budget);
  }
  
  try {
    // Send PUT request - the server will handle upsert if needed
    console.log(`Sending PUT request to update event ${eventId}`, eventToUpdate);
    const response = await axios.put(`${API_URL}/events/${eventId}`, eventToUpdate);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    
    // Save to localStorage as fallback for all errors
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  }
};

// Delete event by ID
export const deleteEventById = async (eventId: string, isAuthenticated: boolean): Promise<boolean> => {
  if (!isAuthenticated) {
    return false;
  }
  
  ensureAuthToken();
  try {
    await axios.delete(`${API_URL}/events/${eventId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    return false;
  }
};

// Legacy functions

// Save event to server or localStorage based on authentication status
export const saveEvent = async (event: Event, isAuthenticated: boolean, isGuestMode: boolean): Promise<Event> => {
  if (isAuthenticated && !isGuestMode) {
    // Check if the event already has an ID
    if (event._id || event.id) {
      const eventId = String(event._id || event.id);
      try {
        // Use PUT for existing events
        console.log(`Saving existing event with ID ${eventId} using PUT`);
        const updatedEvent = await updateEventById(eventId, event, isAuthenticated);
        if (updatedEvent) {
          return updatedEvent;
        }
        // Fallback to localStorage if update fails
        localStorage.setItem('event', JSON.stringify(event));
        return event;
      } catch (error) {
        console.error(`Error updating event with ID ${eventId}:`, error);
        localStorage.setItem('event', JSON.stringify(event));
        return event;
      }
    } else {
      try {
        // Use POST to /events/new to ensure we create a new event and don't overwrite existing ones
        console.log("Creating new event using POST to /events/new");
        // Remove any ID fields to ensure we create a new document
        const newEvent = { ...event };
        delete newEvent._id;
        delete newEvent.id;
        
        const response = await axios.post(`${API_URL}/events/new`, newEvent);
        return response.data;
      } catch (error) {
        console.error('Error creating new event:', error);
        localStorage.setItem('event', JSON.stringify(event));
        return event;
      }
    }
  } else {
    // Guest mode or not authenticated - save to localStorage only
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  }
};

// Save active category to server or localStorage
export const saveActiveCategory = async (category: string, isAuthenticated: boolean, isGuestMode: boolean, eventId?: string): Promise<void> => {
  if (isAuthenticated && !isGuestMode) {
    // Save to server
    ensureAuthToken();
    try {
      // Ensure correct payload format
      const payload = eventId 
        ? { activeCategory: category, eventId: eventId.toString() } 
        : { activeCategory: category };
      console.log('Sending category payload:', payload);
      await axios.patch(`${API_URL}/events/category`, payload);
    } catch (error) {
      console.error('Error saving active category to server:', error);
      // Fallback to localStorage
      localStorage.setItem('activeCategory', category);
    }
  } else {
    // Guest mode or not authenticated - save to localStorage only
    localStorage.setItem('activeCategory', category);
  }
};

// Delete event from server and localStorage
export const deleteEvent = async (isAuthenticated: boolean): Promise<void> => {
  if (isAuthenticated) {
    // Delete from server
    try {
      await axios.delete(`${API_URL}/events/current`);
    } catch (error) {
      console.error('Error deleting event from server:', error);
    }
  }
  
  // Always clear localStorage
  localStorage.removeItem('event');
  localStorage.removeItem('eventStep');
  localStorage.removeItem('activeCategory');
};

// Clear guest data when switching to authenticated mode
export const clearGuestData = (): void => {
  localStorage.removeItem('event');
  localStorage.removeItem('eventStep');
  localStorage.removeItem('activeCategory');
  localStorage.removeItem('guestMode');
};

export default {
  saveEvent,
  getEvent,
  saveEventStep,
  saveActiveCategory,
  deleteEvent,
  clearGuestData,
  // New multi-event functions
  getAllEvents,
  getEventsForStep1,
  getEventById,
  createNewEvent,
  updateEventById,
  deleteEventById
}; 