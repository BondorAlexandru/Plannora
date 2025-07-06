// Collaboration routes for chat and vendor notes
import { ObjectId } from 'mongodb';
import { connectToMongoDB } from '../index.js';
import { authenticate } from '../middleware/auth.js';

export default function collaborationRoutes(app) {
  // Get specific collaboration by ID
  app.get('/api/collaborations/:id', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const usersCollection = db.collection('users');
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Get collaboration where user is either client or planner
      const collaboration = await collaborationsCollection.findOne({
        _id: new ObjectId(id),
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      });
      
      if (!collaboration) {
        return res.status(404).json({ message: 'Collaboration not found or access denied' });
      }
      
      // Populate collaboration information
      const client = await usersCollection.findOne({ _id: collaboration.clientId });
      const planner = await usersCollection.findOne({ _id: collaboration.plannerId });
      const event = await eventsCollection.findOne({ _id: collaboration.eventId });
      
      const populatedCollaboration = {
        _id: collaboration._id,
        clientId: collaboration.clientId,
        plannerId: collaboration.plannerId,
        eventId: collaboration.eventId,
        status: collaboration.status,
        createdAt: collaboration.createdAt,
        clientName: client?.name || 'Unknown',
        plannerName: planner?.name || 'Unknown',
        plannerBusinessName: planner?.plannerProfile?.businessName || '',
        eventName: event?.name || 'Unknown Event',
        eventDate: event?.date || '',
        eventLocation: event?.location || ''
      };
      
      return res.status(200).json(populatedCollaboration);
    } catch (error) {
      console.error('Error fetching collaboration:', error);
      return res.status(500).json({ message: 'Error fetching collaboration', error: error.message });
    }
  });
  
  // Send chat message
  app.post('/api/collaborations/:id/messages', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      
      if (!message || message.trim() === '') {
        return res.status(400).json({ message: 'Message content is required' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const messagesCollection = db.collection('collaborationMessages');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Verify user is part of this collaboration
      const collaboration = await collaborationsCollection.findOne({
        _id: new ObjectId(id),
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      });
      
      if (!collaboration) {
        return res.status(404).json({ message: 'Collaboration not found or access denied' });
      }
      
      // Create chat message
      const chatMessage = {
        collaborationId: new ObjectId(id),
        senderId: userId,
        message: message.trim(),
        timestamp: new Date(),
        edited: false,
        editedAt: null
      };
      
      const result = await messagesCollection.insertOne(chatMessage);
      
      // Update collaboration last activity
      await collaborationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { updatedAt: new Date() } }
      );
      
      return res.status(201).json({
        _id: result.insertedId,
        ...chatMessage,
        senderName: req.user.name
      });
    } catch (error) {
      console.error('Error sending chat message:', error);
      return res.status(500).json({ message: 'Error sending chat message', error: error.message });
    }
  });

  // Get chat messages for a collaboration
  app.get('/api/collaborations/:id/messages', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const messagesCollection = db.collection('collaborationMessages');
      const usersCollection = db.collection('users');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Verify user is part of this collaboration
      const collaboration = await collaborationsCollection.findOne({
        _id: new ObjectId(id),
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      });
      
      if (!collaboration) {
        return res.status(404).json({ message: 'Collaboration not found or access denied' });
      }
      
      // Get messages
      const messages = await messagesCollection.find({
        collaborationId: new ObjectId(id)
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();
      
      // Populate sender information
      const populatedMessages = await Promise.all(messages.map(async (message) => {
        const sender = await usersCollection.findOne({ _id: message.senderId });
        
        return {
          _id: message._id,
          collaborationId: message.collaborationId,
          senderId: message.senderId,
          message: message.message,
          timestamp: message.timestamp,
          edited: message.edited,
          editedAt: message.editedAt,
          senderName: sender?.name || 'Unknown',
          isCurrentUser: message.senderId.toString() === userId.toString()
        };
      }));
      
      return res.status(200).json(populatedMessages.reverse()); // Reverse to get chronological order
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
    }
  });

  // Add vendor note
  app.post('/api/collaborations/:id/vendor-notes', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { providerId, note, rating, tags } = req.body;
      
      if (!providerId || !note || note.trim() === '') {
        return res.status(400).json({ message: 'Provider ID and note content are required' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const vendorNotesCollection = db.collection('vendorNotes');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Verify user is part of this collaboration
      const collaboration = await collaborationsCollection.findOne({
        _id: new ObjectId(id),
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      });
      
      if (!collaboration) {
        return res.status(404).json({ message: 'Collaboration not found or access denied' });
      }
      
      // Create vendor note
      const vendorNote = {
        collaborationId: new ObjectId(id),
        eventId: collaboration.eventId,
        providerId: providerId,
        authorId: userId,
        note: note.trim(),
        rating: rating || null,
        tags: tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await vendorNotesCollection.insertOne(vendorNote);
      
      return res.status(201).json({
        _id: result.insertedId,
        ...vendorNote,
        authorName: req.user.name
      });
    } catch (error) {
      console.error('Error adding vendor note:', error);
      return res.status(500).json({ message: 'Error adding vendor note', error: error.message });
    }
  });

  // Get vendor notes for a collaboration
  app.get('/api/collaborations/:id/vendor-notes', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { providerId } = req.query;
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const vendorNotesCollection = db.collection('vendorNotes');
      const usersCollection = db.collection('users');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Verify user is part of this collaboration
      const collaboration = await collaborationsCollection.findOne({
        _id: new ObjectId(id),
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      });
      
      if (!collaboration) {
        return res.status(404).json({ message: 'Collaboration not found or access denied' });
      }
      
      // Build query
      const query = { collaborationId: new ObjectId(id) };
      if (providerId) {
        query.providerId = providerId;
      }
      
      // Get vendor notes
      const notes = await vendorNotesCollection.find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      // Populate author information
      const populatedNotes = await Promise.all(notes.map(async (note) => {
        const author = await usersCollection.findOne({ _id: note.authorId });
        
        return {
          _id: note._id,
          collaborationId: note.collaborationId,
          eventId: note.eventId,
          providerId: note.providerId,
          authorId: note.authorId,
          note: note.note,
          rating: note.rating,
          tags: note.tags,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          authorName: author?.name || 'Unknown',
          isCurrentUser: note.authorId.toString() === userId.toString()
        };
      }));
      
      return res.status(200).json(populatedNotes);
    } catch (error) {
      console.error('Error fetching vendor notes:', error);
      return res.status(500).json({ message: 'Error fetching vendor notes', error: error.message });
    }
  });

  // Update vendor note
  app.put('/api/collaborations/:id/vendor-notes/:noteId', authenticate, async (req, res) => {
    try {
      const { id, noteId } = req.params;
      const { note, rating, tags } = req.body;
      
      if (!note || note.trim() === '') {
        return res.status(400).json({ message: 'Note content is required' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const vendorNotesCollection = db.collection('vendorNotes');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Verify user is part of this collaboration
      const collaboration = await collaborationsCollection.findOne({
        _id: new ObjectId(id),
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      });
      
      if (!collaboration) {
        return res.status(404).json({ message: 'Collaboration not found or access denied' });
      }
      
      // Update vendor note (only if user is the author)
      const updateData = {
        note: note.trim(),
        rating: rating || null,
        tags: tags || [],
        updatedAt: new Date()
      };
      
      const result = await vendorNotesCollection.updateOne(
        { 
          _id: new ObjectId(noteId),
          collaborationId: new ObjectId(id),
          authorId: userId
        },
        { $set: updateData }
      );
      
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Vendor note not found or access denied' });
      }
      
      return res.status(200).json({ message: 'Vendor note updated successfully' });
    } catch (error) {
      console.error('Error updating vendor note:', error);
      return res.status(500).json({ message: 'Error updating vendor note', error: error.message });
    }
  });

  // Delete vendor note
  app.delete('/api/collaborations/:id/vendor-notes/:noteId', authenticate, async (req, res) => {
    try {
      const { id, noteId } = req.params;
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const vendorNotesCollection = db.collection('vendorNotes');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Verify user is part of this collaboration
      const collaboration = await collaborationsCollection.findOne({
        _id: new ObjectId(id),
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      });
      
      if (!collaboration) {
        return res.status(404).json({ message: 'Collaboration not found or access denied' });
      }
      
      // Delete vendor note (only if user is the author)
      const result = await vendorNotesCollection.deleteOne({
        _id: new ObjectId(noteId),
        collaborationId: new ObjectId(id),
        authorId: userId
      });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Vendor note not found or access denied' });
      }
      
      return res.status(200).json({ message: 'Vendor note deleted successfully' });
    } catch (error) {
      console.error('Error deleting vendor note:', error);
      return res.status(500).json({ message: 'Error deleting vendor note', error: error.message });
    }
  });
} 