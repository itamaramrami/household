import  Router  from 'express';
import  { addTransaction, getTransactions, deleteTransaction, updateTransaction, calculateTotalIncome, calculateTotalExpenses } from '../controllers/TransactionController.js';
import auth from '../middleware/auth.js';

const router = Router();
// הוספת Transaction חדש
router.post('/add', auth, addTransaction);

// שליפת כל ה-Transactions
router.get('/', auth, getTransactions);

// עדכון Transaction קיים
router.put('/:id', auth, updateTransaction);

// מחיקת Transaction
router.delete('/:id', auth, deleteTransaction);
//קבלת כל ההכנסות
router.get('/total-income', auth, calculateTotalIncome);
//קבלת כל ההוצאות
router.get('/total-expenses', auth, calculateTotalExpenses);

export default router;