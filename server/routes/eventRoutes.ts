import express from 'express';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';
import { connectToDatabase } from '../config/database.js';

const router = express.Router();

// Get current/latest event
router.get('/current', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    
    // Find the latest event for this user
    const event = await Event.findOne({ userId }).sort({ updatedAt: -1 });
    
    if (!event) {
      return res.status(404).json({ message: 'No events found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting current event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
router.get('/', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    
    // Find all events for this user
    const events = await Event.find({ userId }).sort({ updatedAt: -1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting all events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    const eventId = req.params.id;
    
    // Find the event by ID and ensure it belongs to this user
    const event = await Event.findOne({ _id: eventId, userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting event by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update an event
router.post('/', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    const eventData = req.body;
    
    // Add the user ID to the event data
    eventData.userId = userId;
    
    // Ensure selectedProviders exists
    if (!eventData.selectedProviders) {
      eventData.selectedProviders = [];
    }
    
    let event;
    
    // If an ID is provided, update the existing event
    if (eventData._id || eventData.id) {
      const eventId = eventData._id || eventData.id;
      
      // Make sure the event belongs to this user
      const existingEvent = await Event.findOne({ 
        _id: eventId, 
        userId 
      });
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Update the event
      event = await Event.findByIdAndUpdate(
        eventId,
        eventData,
        { new: true }
      );
      
      console.log(`Updated existing event with ID: ${eventId}`);
    } else {
      // Check if the user already has events with the same name, to avoid duplicates
      const similarEvent = await Event.findOne({
        userId,
        name: eventData.name
      });
      
      if (similarEvent) {
        // Update the existing event instead of creating a new one
        event = await Event.findByIdAndUpdate(
          similarEvent._id,
          eventData,
          { new: true }
        );
        
        console.log(`Updated similar existing event with ID: ${similarEvent._id}`);
      } else {
        // Create a new event only if no similar event exists
        event = await Event.create(eventData);
        console.log(`Created new event with ID: ${event._id}`);
      }
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error creating/updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new event
router.post('/new', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    const eventData = req.body;
    
    // Add the user ID to the event data
    eventData.userId = userId;
    
    // Ensure selectedProviders exists
    if (!eventData.selectedProviders) {
      eventData.selectedProviders = [];
    }
    
    // Make sure we're not trying to create an event with an existing ID
    if (eventData._id || eventData.id) {
      return res.status(400).json({ 
        message: 'Cannot create new event with an existing ID. Use PUT /api/events/:id to update existing events.' 
      });
    }
    
    // Create a new event
    const event = await Event.create(eventData);
    console.log(`Created new event with ID: ${event._id}`);
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating new event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an event by ID
router.put('/:id', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    const eventId = req.params.id;
    const eventData = req.body;
    
    console.log(`Updating event with ID: ${eventId}`);
    
    // Add the user ID to the event data
    eventData.userId = userId;
    
    // Ensure selectedProviders exists
    if (!eventData.selectedProviders) {
      eventData.selectedProviders = [];
    }
    
    // Make sure the event belongs to this user
    const existingEvent = await Event.findOne({ 
      _id: eventId, 
      userId 
    });
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Remove any ID fields from the request body to prevent MongoDB errors
    delete eventData._id;
    delete eventData.id;
    
    // Update the event
    const event = await Event.findByIdAndUpdate(
      eventId,
      eventData,
      { new: true }
    );
    
    console.log(`Successfully updated event with ID: ${eventId}`);
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an event by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    const eventId = req.params.id;
    
    // Make sure the event belongs to this user
    const existingEvent = await Event.findOne({ 
      _id: eventId, 
      userId 
    });
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete the event
    await Event.findByIdAndDelete(eventId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event step
router.patch('/step', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    const { step, eventId } = req.body;
    
    if (!step) {
      return res.status(400).json({ message: 'Step is required' });
    }
    
    let query = { userId };
    
    // If an event ID is provided, update that specific event
    if (eventId) {
      query._id = eventId;
    } else {
      // Otherwise, get the latest event
      const latestEvent = await Event.findOne({ userId }).sort({ updatedAt: -1 });
      if (!latestEvent) {
        return res.status(404).json({ message: 'No events found' });
      }
      query._id = latestEvent._id;
    }
    
    // Update the event step
    const event = await Event.findOneAndUpdate(
      query,
      { step },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event step:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event category
router.patch('/category', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user._id.toString();
    const { activeCategory, eventId } = req.body;
    
    if (!activeCategory) {
      return res.status(400).json({ message: 'Active category is required' });
    }
    
    let query = { userId };
    
    // If an event ID is provided, update that specific event
    if (eventId) {
      query._id = eventId;
    } else {
      // Otherwise, get the latest event
      const latestEvent = await Event.findOne({ userId }).sort({ updatedAt: -1 });
      if (!latestEvent) {
        return res.status(404).json({ message: 'No events found' });
      }
      query._id = latestEvent._id;
    }
    
    // Update the event category
    const event = await Event.findOneAndUpdate(
      query,
      { activeCategory },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 