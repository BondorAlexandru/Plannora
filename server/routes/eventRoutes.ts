import express from 'express';
import { Event } from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';
import { connectToDatabase } from '../config/database.js';

const router = express.Router();

// Get current event for the authenticated user
router.get('/current', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const event = await Event.findOne({ userId }).sort({ createdAt: -1 });
    res.json(event);
  } catch (error) {
    console.error('Error getting current event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const events = await Event.find({ userId });
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific event by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    const eventId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const event = await Event.findOne({ _id: eventId, userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update an event
router.post('/', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    const eventData = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    let event;
    
    if (eventData._id) {
      // Update existing event
      event = await Event.findOneAndUpdate(
        { _id: eventData._id, userId },
        { $set: eventData },
        { new: true }
      );
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
    } else {
      // Create new event
      event = new Event({
        ...eventData,
        userId
      });
      await event.save();
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error creating/updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new event (ensuring no existing ID is used)
router.post('/new', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    const eventData = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Remove _id if it exists to ensure a new document is created
    delete eventData._id;
    
    const event = new Event({
      ...eventData,
      userId
    });
    
    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error creating new event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an event by ID
router.put('/:id', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    const eventId = req.params.id;
    const eventData = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: eventId, userId },
      { $set: eventData },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an event by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    const eventId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const event = await Event.findOneAndDelete({ _id: eventId, userId });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update step of an event
router.patch('/step', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    const { eventId, step } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: eventId, userId },
      { $set: { step } },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event step:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update active category of an event
router.patch('/category', authenticate, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.user?.userId;
    const { eventId, activeCategory } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: eventId, userId },
      { $set: { activeCategory } },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 