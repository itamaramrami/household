import express from 'express';
import { getAllUsers, deleteUser, searchUsers } from '../controllers/adminController.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { auth } from '../middleware/auth.js';  // שינוי הייבוא והוספת סיומת .js

const router = express.Router();

// הסדר הנכון של הנתיבים - נתיב ספציפי יותר קודם
router.get('/users/search', auth, adminOnly, searchUsers);

// נתיב לקבלת כל המשתמשים
router.get('/users', auth, adminOnly, getAllUsers);

// נתיב למחיקת משתמש
router.delete('/users/:userId', auth, adminOnly, deleteUser);

export default router;