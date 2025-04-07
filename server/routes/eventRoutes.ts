import express from 'express';
import { 
  getUserEvent, 
  saveEvent, 
  deleteEvent, 
  updateEventStep, 
  updateActiveCategory 
} from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

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