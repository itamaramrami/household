import express from 'express';
import { addFixedPayment, getFixedPayments, deleteFixedPayment, updateFixedPayment, calculateTotalFixedPayments } from '../controllers/fixedPaymentsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/add', auth, addFixedPayment);
router.get('/', auth, getFixedPayments);
router.put('/:id', auth, updateFixedPayment);
router.delete('/:id', auth, deleteFixedPayment);
router.get('/total-fixed-payments', auth, calculateTotalFixedPayments);
export default router;
