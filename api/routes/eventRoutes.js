// Event routes
import { ObjectId } from 'mongodb';
import { connectToMongoDB } from '../index.js';
import { authenticate } from '../middleware/auth.js';

export default function eventRoutes(app) {
  // Get all events for user (including collaborative events)
  app.get('/api/events', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Get all events owned by the current user OR where they are a collaborator
      const events = await eventsCollection.find({
        $or: [
          { user: userId },
          { collaborators: userId }
        ]
      })
      .sort({ updatedAt: -1 })
      .toArray();
      
      return res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
  });

  // Get event by ID (with collaboration support)
  app.get('/api/events/:id', authenticate, async (req, res) => {
    try {
      const eventId = req.params.id;
      
      // Validate ObjectId format
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid event ID format' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Get event where user is owner or collaborator
      const event = await eventsCollection.findOne({
        _id: new ObjectId(eventId),
        $or: [
          { user: userId },
          { collaborators: userId }
        ]
      });
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
      
      return res.status(200).json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({ message: 'Error fetching event', error: error.message });
    }
  });

  // Get current event (most recently updated)
  app.get('/api/events/current', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Find the most recently updated event or create a new one
      let event = await eventsCollection
        .find({
          $or: [
            { user: userId },
            { collaborators: userId }
          ]
        })
        .sort({ updatedAt: -1 })
        .limit(1)
        .next();
      
      if (!event) {
        // Create a new event if none found
        const newEvent = {
          user: userId,
          collaborators: [],
          name: '',
          date: new Date().toISOString().split('T')[0],
          location: '',
          guestCount: 0,
          budget: 0,
          eventType: 'Party',
          selectedProviders: [],
          step: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await eventsCollection.insertOne(newEvent);
        return res.status(201).json({ 
          ...newEvent, 
          _id: result.insertedId 
        });
      }
      
      return res.status(200).json(event);
    } catch (error) {
      console.error('Error fetching current event:', error);
      return res.status(500).json({ message: 'Error fetching current event', error: error.message });
    }
  });

  // Create new event
  app.post('/api/events/new', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      const newEvent = {
        user: userId,
        collaborators: [],
        name: req.body.name || '',
        date: req.body.date || new Date().toISOString().split('T')[0],
        location: req.body.location || '',
        guestCount: req.body.guestCount || 0,
        budget: req.body.budget || 0,
        eventType: req.body.eventType || 'Party',
        selectedProviders: req.body.selectedProviders || [],
        step: req.body.step || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await eventsCollection.insertOne(newEvent);
      return res.status(201).json({ 
        ...newEvent, 
        _id: result.insertedId 
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ message: 'Error creating event', error: error.message });
    }
  });

  // Update event by ID (with collaboration support)
  app.put('/api/events/:id', authenticate, async (req, res) => {
    try {
      const eventId = req.params.id;
      
      // Validate ObjectId format first
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid event ID format' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Check if user has access to this event
      const existingEvent = await eventsCollection.findOne({
        _id: new ObjectId(eventId),
        $or: [
          { user: userId },
          { collaborators: userId }
        ]
      });
      
      if (!existingEvent) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
      
      // Prepare the update data
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Remove _id if present to avoid MongoDB errors
      delete updateData._id;
      delete updateData.id;
      
      // Don't allow changing the owner or collaborators through this endpoint
      delete updateData.user;
      delete updateData.collaborators;
      
      // Log what we're trying to update for debugging
      console.log(`Updating event ${eventId} for user ${userId}`, updateData);
      
      // Update the event
      const result = await eventsCollection.updateOne(
        { _id: new ObjectId(eventId) },
        { $set: updateData }
      );
      
      if (result.acknowledged && result.modifiedCount > 0) {
        const updatedEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        return res.status(200).json(updatedEvent);
      } else {
        return res.status(500).json({ message: 'Failed to update event' });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({ message: 'Error updating event', error: error.message });
    }
  });

  // Update event step
  app.patch('/api/events/step', authenticate, async (req, res) => {
    try {
      const { eventId, step } = req.body;
      
      if (!eventId || !step) {
        return res.status(400).json({ message: 'Event ID and step are required' });
      }
      
      // Validate ObjectId format
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid event ID format' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Update step with collaboration support
      const result = await eventsCollection.updateOne(
        { 
          _id: new ObjectId(eventId),
          $or: [
            { user: userId },
            { collaborators: userId }
          ]
        },
        { 
          $set: { 
            step: parseInt(step),
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
      
      return res.status(200).json({ message: 'Event step updated successfully' });
    } catch (error) {
      console.error('Error updating event step:', error);
      return res.status(500).json({ message: 'Error updating event step', error: error.message });
    }
  });

  // Update active category
  app.patch('/api/events/category', authenticate, async (req, res) => {
    try {
      const { eventId, activeCategory } = req.body;
      
      if (!eventId || !activeCategory) {
        return res.status(400).json({ message: 'Event ID and active category are required' });
      }
      
      // Validate ObjectId format
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid event ID format' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Update category with collaboration support
      const result = await eventsCollection.updateOne(
        { 
          _id: new ObjectId(eventId),
          $or: [
            { user: userId },
            { collaborators: userId }
          ]
        },
        { 
          $set: { 
            activeCategory,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
      
      return res.status(200).json({ message: 'Event category updated successfully' });
    } catch (error) {
      console.error('Error updating event category:', error);
      return res.status(500).json({ message: 'Error updating event category', error: error.message });
    }
  });

  // Delete event by ID (with collaboration support)
  app.delete('/api/events/:id', authenticate, async (req, res) => {
    try {
      const eventId = req.params.id;
      
      // Validate ObjectId format
      if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid event ID format' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Only allow deletion if user is the owner (not collaborator)
      const result = await eventsCollection.deleteOne({ 
        _id: new ObjectId(eventId),
        user: userId
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
      
      return res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
  });

  // Delete current event (legacy route)
  app.delete('/api/events/current', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Find the most recently updated event and delete it
      const event = await eventsCollection
        .find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(1)
        .next();
      
      if (!event) {
        return res.status(404).json({ message: 'No events found' });
      }
      
      const result = await eventsCollection.deleteOne({ 
        _id: event._id,
        user: userId
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Event not found or access denied' });
      }
      
      return res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting current event:', error);
      return res.status(500).json({ message: 'Error deleting current event', error: error.message });
    }
  });
} 