import express from 'express';
import { 
  getUserEvent, 
  saveEvent, 
  deleteEvent,
  updateEventStep, 
  updateActiveCategory,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEventById
} from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes need authentication
router.use(authenticate);

// Event routes
// Legacy routes for backward compatibility
router.get('/current', getUserEvent);  // Get current/latest event
router.post('/', saveEvent);           // Create/update current event
router.delete('/current', deleteEvent);  // Delete current event

// New routes for multiple events
router.get('/', getAllEvents);         // Get all events
router.get('/:id', getEventById);      // Get specific event by ID
router.post('/new', createEvent);      // Create a new event
router.put('/:id', updateEvent);       // Update specific event
router.delete('/:id', deleteEventById); // Delete specific event

// Step and category routes (support both legacy and multi-event)
router.patch('/step', updateEventStep);
router.patch('/category', updateActiveCategory);

export default router; 