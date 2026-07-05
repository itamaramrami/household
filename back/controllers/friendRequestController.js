import FriendRequest from '../models/friendRequestModel.js';
import User from '../models/user.model.js';
import { addFriend } from './House.controller.js';
import {syncDataWithNewFriend} from './House.controller.js';

/**
 * שליחת בקשת חברות
 */
export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        const senderId = req.user.id;
        const senderEmail = req.user.email;

        if (!recipientEmail) {
            return res.status(400).json({ 
                success: false,
                message: "מייל של המקבל נדרש" 
            });
        }

        // בדיקה אם המשתמש עם המייל הזה קיים
        const recipient = await User.findOne({ email: recipientEmail });
        if (!recipient) {
            return res.status(404).json({ 
                success: false,
                message: "משתמש עם המייל הזה לא נמצא" 
            });
        }

        // בדיקה אם המשתמש מנסה לשלוח בקשה לעצמו
        if (senderEmail === recipientEmail) {
            return res.status(400).json({ 
                success: false,
                message: "לא ניתן לשלוח בקשת חברות לעצמך" 
            });
        }

        // בדיקה אם כבר חברים
        const sender = await User.findById(senderId);
        if (sender.friends.includes(recipientEmail)) {
            return res.status(400).json({ 
                success: false,
                message: "משתמש זה כבר נמצא ברשימת החברים שלך" 
            });
        }

        // בדיקה אם כבר קיימת בקשת חברות פעילה
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            recipient: recipient._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ 
                success: false,
                message: "בקשת החברות כבר נשלחה למשתמש זה" 
            });
        }

        // יצירת בקשת חברות חדשה
        const friendRequest = new FriendRequest({
            sender: senderId,
            senderEmail,
            recipient: recipient._id,
        });

        await friendRequest.save();

        res.status(201).json({ 
            success: true,
            message: "בקשת החברות נשלחה בהצלחה" 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: "שגיאת שרת", 
            error: error.message 
        });
    }
};

/**
 * הצגת בקשות החברות
 */

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const friendRequests = await FriendRequest.find({ 
            recipient: userId, 
            status: 'pending' 
        })
        .populate('sender', 'name email')
        .exec();

        res.status(200).json({
            success: true,
            requests: friendRequests  // החזרת הבקשות האמיתיות במקום מערך ריק
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            requests: [],
            message: "שגיאת שרת"
        });
    }
};
export const acceptFriendRequest = async (req, res) => {
    try {
      const { requestId } = req.body;
      const userId = req.user._id; // שימוש ב-_id במקום id
  
      // מציאת בקשת החבר
      const friendRequest = await FriendRequest.findById(requestId);
      console.log("Found friend request:", friendRequest);
      
      if (!friendRequest) {
        return res.status(404).json({ success: false, message: "הבקשה לא נמצאה" });
      }
  
      // בדיקת הרשאה
      if (friendRequest.recipient.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "אין לך הרשאה לאשר את הבקשה הזאת" });
      }
  
      // מציאת המשתמשים
      const senderUser = await User.findById(friendRequest.sender);
      const recipientUser = await User.findById(userId);
  
      if (!senderUser || !recipientUser) {
        return res.status(404).json({ success: false, message: "אחד המשתמשים לא נמצא" });
      }
  
      // הוספת החברים לרשימות אחד של השני
      senderUser.friends.push(recipientUser.email);
      recipientUser.friends.push(senderUser.email);
  
      await senderUser.save();
      await recipientUser.save();
  
      // סנכרון הנתונים
      try {
        await syncDataWithNewFriend(friendRequest.sender, userId);
        
        // עדכון סטטוס הבקשה
        friendRequest.status = 'accepted';
        await friendRequest.save();
  
        // מחיקת הבקשה אחרי שאושרה
        await FriendRequest.findByIdAndDelete(requestId);
  
        return res.status(200).json({
          success: true,
          message: "החבר נוסף והנתונים סונכרנו בהצלחה",
          friend: {
            email: senderUser.email,
            name: senderUser.name
          }
        });
      } catch (syncError) {
        console.error('Error in data sync:', syncError);
        return res.status(200).json({
          success: true,
          message: "החבר נוסף אבל היתה בעיה בסנכרון הנתונים",
          friend: {
            email: senderUser.email,
            name: senderUser.name
          }
        });
      }
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
      return res.status(500).json({ 
        success: false, 
        message: "שגיאה באישור בקשת החברות" 
      });
    }
  };

export const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;  // מזהה הבקשה מגיע מגוף הבקשה
        const userId = req.user.id;      // מזהה המשתמש הנוכחי מגיע מה-middleware

        // מציאת בקשת החברות לפי מזהה
        const friendRequest = await FriendRequest.findById(requestId);
        console.log("🚀 ~ rejectFriendRequest ~ friendRequest:", friendRequest);

        if (!friendRequest) {
            return res.status(404).json({ message: "הבקשה לא נמצאה" });
        }

        // בדוק אם הבקשה שייכת למשתמש הנוכחי
        if (friendRequest.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ message: "אין לך הרשאה לדחות את הבקשה הזאת" });
        }

        // עדכון הסטטוס ל- "rejected"
        friendRequest.status = 'rejected';
        await friendRequest.save();  // שמירה במסד הנתונים

        // מחיקת הבקשה אחרי שהיא נדחתה
        await FriendRequest.findByIdAndDelete(requestId);

        res.status(200).json({ message: "הבקשה נדחתה והוסרה בהצלחה" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "שגיאה בשרת" });
    }
};




