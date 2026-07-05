import { Router } from 'express';
import { addEvent, deleteEvent, getAllEvents, updateEvent, addToGoogleCalendar} from '../controllers/eventsController.js';
import auth from '../middleware/auth.js';
// import { googleAuth } from '../controllers/House.controller.js'
const router = Router();

router.post('/add', auth, addEvent);
router.get('/', auth, getAllEvents);
router.delete('/:id', auth, deleteEvent);
router.put('/:id', auth, updateEvent);
router.post('/add-to-calendar', auth, addToGoogleCalendar);
export default router;
