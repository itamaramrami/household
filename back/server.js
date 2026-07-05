import express from "express";
import dotenv from "dotenv";
import contactDb from "./db/contactDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import HouseRoutes from "./routes/House.route.js";
import adminRoutes from "./routes/adminRoutes.js";
import shoppingRoutes from "./routes/shoppingRoutes.js";
import User from './models/user.model.js'; // הייבוא של מודל המשתמש
import bcrypt from 'bcryptjs'; // ספריית bcrypt לחיזוק סיסמאות

import event from "./routes/events.js"
import savingsRoutes from "./routes/savingsRoutes.js"
import fixedPaymentsRoutes from "./routes/fixedPaymentsRoutes.js"

import transactionsRoutes from "./routes/transactionsRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import friendRequestRoutes from './routes/friendRequestRoutes.js'

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();
const createAdmin = async () => {
    try {
        // בודק אם כבר קיים משתמש אדמין במערכת
        const existingAdmin = await User.findOne({ email: 'Admin@gmail.com' });

        if (!existingAdmin) {
            // סיסמה שאתה רוצה להגדיר לאדמין
            const plainPassword = '123123'; // הכנס כאן את הסיסמה שלך

            // הצפנת הסיסמה
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            // יצירת משתמש אדמין חדש
            const adminUser = new User({
                email: 'Admin@gmail.com',  // המייל שלך כאדמין
                password: hashedPassword,    // הסיסמה המוצפנת
                name: 'Admin ',          // שם המשתמש
                role: 'admin'                // תפקיד אדמין
            });

            // שמירת המשתמש
            await adminUser.save();
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

// הפעלת הפונקציה כשאתה מפעיל את המערכת
createAdmin();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/api/friends', friendRequestRoutes);

app.use("/api/House", HouseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/events',event);
app.use('/api/transaction',transactionsRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/fixedPayments', fixedPaymentsRoutes);
app.use('/api/task',taskRoutes)
app.listen(PORT, () => {
    contactDb();
    console.log('Server is running on port:', PORT);
});
