import axios from 'axios';
import { Event } from '../types';

// Define the base URL for API calls
const API_URL = '/api';

// Save event to server or localStorage based on authentication status
export const saveEvent = async (event: Event, isAuthenticated: boolean, isGuestMode: boolean): Promise<Event> => {
  if (isAuthenticated && !isGuestMode) {
    // Save to server
    try {
      const response = await axios.post(`${API_URL}/events`, event);
      return response.data;
    } catch (error) {
      console.error('Error saving event to server:', error);
      // Fallback to localStorage if API call fails
      localStorage.setItem('event', JSON.stringify(event));
      return event;
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
      const response = await axios.get(`${API_URL}/events`);
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
export const saveEventStep = async (step: number, isAuthenticated: boolean, isGuestMode: boolean): Promise<void> => {
  if (isAuthenticated && !isGuestMode) {
    // Save to server
    try {
      await axios.patch(`${API_URL}/events/step`, { step });
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
export const saveActiveCategory = async (category: string, isAuthenticated: boolean, isGuestMode: boolean): Promise<void> => {
  if (isAuthenticated && !isGuestMode) {
    // Save to server
    try {
      await axios.patch(`${API_URL}/events/category`, { activeCategory: category });
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
      await axios.delete(`${API_URL}/events`);
    } catch (error) {
      console.error('Error deleting event from server:', error);
    }
  }
  
  // Always clear localStorage
  localStorage.removeItem('event');
  localStorage.removeItem('eventStep');
  localStorage.removeItem('activeCategory');
};

// Clear all guest data from localStorage
export const clearGuestData = (): void => {
  localStorage.removeItem('event');
  localStorage.removeItem('eventStep');
  localStorage.removeItem('activeCategory');
};

export default {
  saveEvent,
  getEvent,
  saveEventStep,
  saveActiveCategory,
  deleteEvent,
  clearGuestData
}; 