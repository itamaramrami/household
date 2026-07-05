import express from 'express';
import { sendFriendRequest, getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../controllers/friendRequestController.js';
import { auth } from '../middleware/auth.js'; // ייבוא הפונקציה שלך לאימות משתמשים

const router = express.Router();

// שליחת בקשת חברות
router.post('/request', auth, sendFriendRequest);

// הצגת בקשות החברות של המשתמש המחובר
router.get('/requests', auth, getFriendRequests);

router.post('/approve', auth, acceptFriendRequest);
router.post('/reject', auth, rejectFriendRequest);



export default router;
