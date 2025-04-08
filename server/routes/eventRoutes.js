import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Get Event model
const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({
  userId: String,
  name: String,
  date: Date,
  location: String,
  description: String,
  eventType: String,
  status: String
}));

// Get all events for a user
router.get('/', async (req, res) => {
  try {
    // In a real app, you would get the user ID from the authenticated user
    const userId = req.query.userId || 'default-user';
    
    const events = await Event.find({ userId });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { userId, name, date, location, description, eventType } = req.body;
    
    const event = new Event({
      userId: userId || 'default-user',
      name,
      date: date ? new Date(date) : new Date(),
      location,
      description,
      eventType: eventType || 'other',
      status: 'draft'
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const { name, date, location, description, eventType, status } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (name) event.name = name;
    if (date) event.date = new Date(date);
    if (location) event.location = location;
    if (description) event.description = description;
    if (eventType) event.eventType = eventType;
    if (status) event.status = status;
    
    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 