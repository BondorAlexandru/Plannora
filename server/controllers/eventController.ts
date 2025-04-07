import { Request, Response } from 'express';
import Event from '../models/Event';

// Get user's event
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

// Create or update user's event
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

// Delete user's event
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
    const { step } = req.body;
    
    if (!step) {
      return res.status(400).json({ message: 'Step is required' });
    }
    
    // Find the event
    const event = await Event.findOne({ user: userId });
    
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
    const { activeCategory } = req.body;
    
    // Find the event
    const event = await Event.findOne({ user: userId });
    
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