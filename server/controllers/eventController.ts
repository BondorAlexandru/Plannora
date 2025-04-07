import { Request, Response } from 'express';
import Event from '../models/Event.js';

// Get user's events (all events)
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    // Find all events for this user
    const events = await Event.find({ user: userId }).sort({ updatedAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error fetching events data' });
  }
};

// Get user's single event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.id;
    
    // Find specific event by ID and make sure it belongs to the user
    const event = await Event.findOne({ _id: eventId, user: userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error fetching event data' });
  }
};

// Get user's latest event (for backward compatibility)
export const getUserEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    // Find event by user ID (most recent one)
    const event = await Event.findOne({ user: userId }).sort({ updatedAt: -1 });
    
    if (!event) {
      return res.status(404).json({ message: 'No event found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error fetching event data' });
  }
};

// Create a new event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const eventData = req.body;
    
    // Create new event
    const event = await Event.create({
      user: userId,
      ...eventData
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// Update an existing event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.id;
    const eventData = req.body;
    
    // Find and update the event
    const event = await Event.findOneAndUpdate(
      { _id: eventId, user: userId },
      { ...eventData },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error updating event data' });
  }
};

// Create or update user's event (legacy function for backward compatibility)
export const saveEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const eventData = req.body;
    
    // Find the existing event
    let event = await Event.findOne({ user: userId });
    
    if (event) {
      // Update existing event
      event = await Event.findByIdAndUpdate(
        event._id,
        { ...eventData },
        { new: true, runValidators: true }
      );
    } else {
      // Create new event
      event = await Event.create({
        user: userId,
        ...eventData
      });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ message: 'Server error saving event data' });
  }
};

// Delete specific event by ID
export const deleteEventById = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.id;
    
    // Find and delete the event
    const event = await Event.findOneAndDelete({ _id: eventId, user: userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// Delete user's event (legacy function for backward compatibility)
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    // Find and delete the event
    const event = await Event.findOneAndDelete({ user: userId });
    
    if (!event) {
      return res.status(404).json({ message: 'No event found to delete' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// Update event planning step
export const updateEventStep = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { step, eventId } = req.body;
    
    if (!step) {
      return res.status(400).json({ message: 'Step is required' });
    }
    
    // If eventId is provided, find that specific event
    const query = eventId ? { _id: eventId, user: userId } : { user: userId };
    
    // Find the event
    const event = await Event.findOne(query);
    
    if (!event) {
      return res.status(404).json({ message: 'No event found' });
    }
    
    // Update step
    event.step = step;
    await event.save();
    
    res.status(200).json({ message: 'Event step updated', step });
  } catch (error) {
    console.error('Error updating event step:', error);
    res.status(500).json({ message: 'Server error updating event step' });
  }
};

// Update active category
export const updateActiveCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { activeCategory, eventId } = req.body;
    
    // If eventId is provided, find that specific event
    const query = eventId ? { _id: eventId, user: userId } : { user: userId };
    
    // Find the event
    const event = await Event.findOne(query);
    
    if (!event) {
      return res.status(404).json({ message: 'No event found' });
    }
    
    // Update active category
    event.activeCategory = activeCategory;
    await event.save();
    
    res.status(200).json({ message: 'Active category updated', activeCategory });
  } catch (error) {
    console.error('Error updating active category:', error);
    res.status(500).json({ message: 'Server error updating active category' });
  }
}; 