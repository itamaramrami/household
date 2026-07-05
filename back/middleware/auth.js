import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "אין הרשאה - חסר טוקן"
            });
        }

        // מנקים את הטוקן מכפילויות של Bearer
        const token = authHeader.replace(/^Bearer\s+/i, '').replace(/^Bearer\s+/i, '');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user_id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "משתמש לא נמצא"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Error:', {
            name: error.name,
            message: error.message,
            originalToken: req.header('Authorization')
        });
        
        res.status(401).json({
            success: false,
            message: "ההרשאה נכשלה",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// מייצא את ה-middleware שלנו כברירת מחדל
export default auth;