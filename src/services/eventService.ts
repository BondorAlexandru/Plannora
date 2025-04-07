import axios from 'axios';
import { Event } from '../types';

// Define the base URL for API calls
const API_URL = '/api';

// Get all events from server (only works when authenticated)
export const getAllEvents = async (isAuthenticated: boolean): Promise<Event[]> => {
  if (!isAuthenticated) {
    return [];
  }
  
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
  if (!isAuthenticated) {
    return null;
  }
  
  try {
    const response = await axios.get(`${API_URL}/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    return null;
  }
};

// Create a new event on the server (first-time creation only)
export const createNewEvent = async (event: Event, isAuthenticated: boolean): Promise<Event | null> => {
  if (!isAuthenticated) {
    localStorage.setItem('event', JSON.stringify(event));
    return event;
  }
  
  try {
    // Remove any ID fields to ensure we create a new document
    const newEvent = { ...event };
    delete newEvent._id;
    delete newEvent.id;
    
    // Always use /events/new endpoint to ensure a new event is created
    // and not overwriting an existing one with the same name
    const response = await axios.post(`${API_URL}/events/new`, newEvent);
    return response.data;
  } catch (error) {
    console.error('Error creating new event:', error);
    return null;
  }
};

// Update existing event by ID - only use for events with an ID
export const updateEventById = async (eventId: string, event: Event, isAuthenticated: boolean): Promise<Event | null> => {
  if (!isAuthenticated) {
    return null;
  }
  
  try {
    // Create a copy of the event without ID fields to prevent MongoDB errors
    const eventToUpdate = { ...event };
    delete eventToUpdate._id;
    delete eventToUpdate.id;
    
    // Always use PUT for updates
    console.log(`Sending PUT request to update event ${eventId}`);
    const response = await axios.put(`${API_URL}/events/${eventId}`, eventToUpdate);
    return response.data;
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    return null;
  }
};

// Delete event by ID
export const deleteEventById = async (eventId: string, isAuthenticated: boolean): Promise<boolean> => {
  if (!isAuthenticated) {
    return false;
  }
  
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

// Get event from server or localStorage based on authentication status
export const getEvent = async (isAuthenticated: boolean, isGuestMode: boolean): Promise<Event | null> => {
  if (isAuthenticated && !isGuestMode) {
    // Get from server
    try {
      const response = await axios.get(`${API_URL}/events/current`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event from server:', error);
      // Fallback to localStorage if API call fails
      const storedEvent = localStorage.getItem('event');
      return storedEvent ? JSON.parse(storedEvent) : null;
    }
  } else {
    // Guest mode or not authenticated - get from localStorage only
    const storedEvent = localStorage.getItem('event');
    return storedEvent ? JSON.parse(storedEvent) : null;
  }
};

// Save event step to server or localStorage
export const saveEventStep = async (step: number, isAuthenticated: boolean, isGuestMode: boolean, eventId?: string): Promise<void> => {
  if (isAuthenticated && !isGuestMode) {
    // Save to server
    try {
      const payload = eventId ? { step, eventId } : { step };
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

// Save active category to server or localStorage
export const saveActiveCategory = async (category: string, isAuthenticated: boolean, isGuestMode: boolean, eventId?: string): Promise<void> => {
  if (isAuthenticated && !isGuestMode) {
    // Save to server
    try {
      const payload = eventId ? { activeCategory: category, eventId } : { activeCategory: category };
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