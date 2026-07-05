import express from 'express';
import { addSavings, getSavings, deleteSavings, updateSavings, calculateTotalSavings } from '../controllers/savingsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/add', auth, addSavings);
router.get('/', auth, getSavings);
router.put('/:id', auth, updateSavings);
router.delete('/:id', auth, deleteSavings);
router.get('/total-savings', auth, calculateTotalSavings);
export default router;
