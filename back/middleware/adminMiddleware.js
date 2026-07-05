// middleware/adminMiddleware.js

export const adminOnly = (req, res, next) => {
    // נניח שההרשאות והאימות מבוצעים עם טוקן JWT
    const userRole = req.user.role; // נקבל את התפקיד מה-JWT

    if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    next();
};
