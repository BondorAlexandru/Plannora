import express from 'express';
import { 
  getUserEvent, 
  saveEvent, 
  deleteEvent, 
  updateEventStep, 
  updateActiveCategory 
} from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes need authentication
router.use(authenticate);

// Event routes
router.get('/', getUserEvent);
router.post('/', saveEvent);
router.delete('/', deleteEvent);
router.patch('/step', updateEventStep);
router.patch('/category', updateActiveCategory);

export default router; 