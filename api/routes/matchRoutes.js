// Match request and collaboration routes
import { ObjectId } from 'mongodb';
import { connectToMongoDB } from '../index.js';
import { authenticate } from '../middleware/auth.js';

export default function matchRoutes(app) {
  // Get all planners for clients to browse
  app.get('/api/planners', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const usersCollection = db.collection('users');
      
      // Get all planner accounts
      const planners = await usersCollection.find({
        accountType: 'planner',
        'plannerProfile.isAvailable': true
      }).toArray();
      
      // Format planners for frontend consumption
      const formattedPlanners = planners.map(planner => ({
        id: planner._id,
        name: planner.name,
        email: planner.email,
        businessName: planner.plannerProfile.businessName,
        services: planner.plannerProfile.services,
        experience: planner.plannerProfile.experience,
        description: planner.plannerProfile.description,
        pricing: planner.plannerProfile.pricing,
        portfolio: planner.plannerProfile.portfolio,
        rating: planner.plannerProfile.rating,
        reviewCount: planner.plannerProfile.reviewCount
      }));
      
      return res.status(200).json(formattedPlanners);
    } catch (error) {
      console.error('Error fetching planners:', error);
      return res.status(500).json({ message: 'Error fetching planners', error: error.message });
    }
  });

  // Send match request
  app.post('/api/match-requests', authenticate, async (req, res) => {
    try {
      const { receiverId, targetUserId, eventId, message } = req.body;
      const actualReceiverId = receiverId || targetUserId;
      
      if (!actualReceiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const matchRequestsCollection = db.collection('matchRequests');
      const usersCollection = db.collection('users');
      const eventsCollection = db.collection('events');
      
      // Validate target user exists
      const targetUser = await usersCollection.findOne({ _id: new ObjectId(actualReceiverId) });
      if (!targetUser) {
        return res.status(404).json({ message: 'Target user not found' });
      }
      
      // For now, make eventId optional - we'll create a general match request
      let event = null;
      if (eventId) {
        event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
      }
      
      // Check if request already exists
      const existingRequest = await matchRequestsCollection.findOne({
        senderId: new ObjectId(req.user._id),
        receiverId: new ObjectId(actualReceiverId),
        $or: [
          { eventId: eventId ? new ObjectId(eventId) : null },
          { eventId: { $exists: false } }
        ],
        status: 'pending'
      });
      
      if (existingRequest) {
        return res.status(400).json({ message: 'Match request already sent' });
      }
      
      // Create match request
      const matchRequest = {
        senderId: new ObjectId(req.user._id),
        receiverId: new ObjectId(actualReceiverId),
        eventId: eventId ? new ObjectId(eventId) : null,
        message: message || '',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await matchRequestsCollection.insertOne(matchRequest);
      
      return res.status(201).json({
        _id: result.insertedId,
        ...matchRequest,
        senderName: req.user.name,
        eventName: event ? event.name : 'General collaboration request'
      });
    } catch (error) {
      console.error('Error sending match request:', error);
      return res.status(500).json({ message: 'Error sending match request', error: error.message });
    }
  });

  // Get match requests (received)
  app.get('/api/match-requests/received', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const matchRequestsCollection = db.collection('matchRequests');
      const usersCollection = db.collection('users');
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Get received match requests
      const requests = await matchRequestsCollection.find({
        receiverId: userId,
        status: 'pending'
      }).sort({ createdAt: -1 }).toArray();
      
      // Populate sender and event information
      const populatedRequests = await Promise.all(requests.map(async (request) => {
        const sender = await usersCollection.findOne({ _id: request.senderId });
        const event = await eventsCollection.findOne({ _id: request.eventId });
        
        return {
          _id: request._id,
          senderId: request.senderId,
          eventId: request.eventId,
          message: request.message,
          status: request.status,
          createdAt: request.createdAt,
          senderName: sender?.name || 'Unknown',
          senderEmail: sender?.email || '',
          eventName: event?.name || 'Unknown Event',
          eventDate: event?.date || '',
          eventLocation: event?.location || ''
        };
      }));
      
      return res.status(200).json(populatedRequests);
    } catch (error) {
      console.error('Error fetching match requests:', error);
      return res.status(500).json({ message: 'Error fetching match requests', error: error.message });
    }
  });

  // Get match requests (sent)
  app.get('/api/match-requests/sent', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const matchRequestsCollection = db.collection('matchRequests');
      const usersCollection = db.collection('users');
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Get sent match requests
      const requests = await matchRequestsCollection.find({
        senderId: userId
      }).sort({ createdAt: -1 }).toArray();
      
      // Populate receiver and event information
      const populatedRequests = await Promise.all(requests.map(async (request) => {
        const receiver = await usersCollection.findOne({ _id: request.receiverId });
        const event = await eventsCollection.findOne({ _id: request.eventId });
        
        return {
          _id: request._id,
          receiverId: request.receiverId,
          eventId: request.eventId,
          message: request.message,
          status: request.status,
          createdAt: request.createdAt,
          receiverName: receiver?.name || 'Unknown',
          receiverEmail: receiver?.email || '',
          eventName: event?.name || 'Unknown Event',
          eventDate: event?.date || '',
          eventLocation: event?.location || ''
        };
      }));
      
      return res.status(200).json(populatedRequests);
    } catch (error) {
      console.error('Error fetching sent match requests:', error);
      return res.status(500).json({ message: 'Error fetching sent match requests', error: error.message });
    }
  });

  // Accept/Decline match request
  app.patch('/api/match-requests/:id', authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Status must be either "accepted" or "declined"' });
      }
      
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const matchRequestsCollection = db.collection('matchRequests');
      const collaborationsCollection = db.collection('collaborations');
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Find the match request
      const matchRequest = await matchRequestsCollection.findOne({
        _id: new ObjectId(id),
        receiverId: userId,
        status: 'pending'
      });
      
      if (!matchRequest) {
        return res.status(404).json({ message: 'Match request not found' });
      }
      
      // Update match request status
      await matchRequestsCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status,
            updatedAt: new Date()
          }
        }
      );
      
      // If accepted, create collaboration and update event
      if (status === 'accepted') {
        let eventId = matchRequest.eventId;
        
        // If no event is associated with the match request, create a basic event template
        if (!eventId) {
          const usersCollection = db.collection('users');
          const sender = await usersCollection.findOne({ _id: matchRequest.senderId });
          
          const basicEvent = {
            name: 'New Collaboration Event',
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            location: 'To be determined',
            eventType: 'general',
            guestCount: 50,
            budget: 5000,
            services: [],
            selectedProviders: [],
            user: matchRequest.senderId,
            collaborators: [matchRequest.receiverId],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const eventResult = await eventsCollection.insertOne(basicEvent);
          eventId = eventResult.insertedId;
        } else {
          // Update existing event to include both users as owners
          await eventsCollection.updateOne(
            { _id: eventId },
            { 
              $addToSet: { 
                collaborators: matchRequest.receiverId 
              },
              $set: { 
                updatedAt: new Date()
              }
            }
          );
        }
        
        // Create collaboration
        const collaboration = {
          clientId: matchRequest.senderId,
          plannerId: matchRequest.receiverId,
          eventId: eventId,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await collaborationsCollection.insertOne(collaboration);
      }
      
      return res.status(200).json({ message: `Match request ${status}` });
    } catch (error) {
      console.error('Error updating match request:', error);
      return res.status(500).json({ message: 'Error updating match request', error: error.message });
    }
  });

  // Get active collaborations
  app.get('/api/collaborations', authenticate, async (req, res) => {
    try {
      const { db } = await connectToMongoDB();
      if (!db) {
        return res.status(500).json({ message: 'Database connection failed' });
      }
      
      const collaborationsCollection = db.collection('collaborations');
      const usersCollection = db.collection('users');
      const eventsCollection = db.collection('events');
      
      const userId = req.user._id === 'admin-id' ? 'admin-id' : new ObjectId(req.user._id);
      
      // Get active collaborations where user is either client or planner
      const collaborations = await collaborationsCollection.find({
        $or: [
          { clientId: userId },
          { plannerId: userId }
        ],
        status: 'active'
      }).toArray();
      
      // Populate collaboration information
      const populatedCollaborations = await Promise.all(collaborations.map(async (collaboration) => {
        const client = await usersCollection.findOne({ _id: collaboration.clientId });
        const planner = await usersCollection.findOne({ _id: collaboration.plannerId });
        const event = await eventsCollection.findOne({ _id: collaboration.eventId });
        
        return {
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
      }));
      
      return res.status(200).json(populatedCollaborations);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      return res.status(500).json({ message: 'Error fetching collaborations', error: error.message });
    }
  });
} 