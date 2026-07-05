import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, user_id,role,name) => {
    console.log("Generating token with name:", name);
    const encodedName = typeof name === 'string' ? Buffer.from(name, 'utf8').toString('utf8') : '';
    const token = jwt.sign({ user_id,role ,name:encodedName}, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    // שמירה של הטוקן בעוגיה (cookie)
    res.cookie("token", token, {
        httpOnly: true, // לא ניתן לגשת אליו בעזרת JavaScript
        secure: process.env.NODE_ENV === "production", // רק ב-https
        sameSite: "strict", // הגנה מפני CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // טווח זמן לתוקף של העוגיה
    });

    // החזרת הטוקן בתגובה
    return token
};

