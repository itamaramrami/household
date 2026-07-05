import mongoose from "mongoose";
import Transaction  from "../models/transactionsModel.js"
import transactionSchema from "../models/transactionsModel.js"
import User from "../models/user.model.js";
/**
 * הוספת Transaction חדש
 */
export const addTransaction = async (req, res) => {
  const { type, amount, description, category, date } = req.body;

  try {
    const userId = req.user.id;

    // יצירת מזהה ייחודי לקבוצה
    const transactionGroupId = new mongoose.Types.ObjectId();

    // יצירת ה-Transaction עבור המשתמש הראשי
    const newTransaction = await Transaction.create({
      userId,
      type,
      amount,
      description,
      category,
      date,
      transactionGroupId,
    });

    const friendEmails = req.user.friends;

    // אם אין חברים, מחזירים את הרשומה הראשית בלבד
    if (!friendEmails || friendEmails.length === 0) {
      return res.status(201).json(newTransaction);
    }

    // מציאת מזהי המשתמשים של החברים
    const friends = await User.find({ email: { $in: friendEmails } });

    // הכנת רשומות עבור החברים עם אותו transactionGroupId
    const transactionsToAdd = friends.map((friend) => ({
      userId: friend._id,
      type,
      amount,
      description,
      category,
      date,
      transactionGroupId,
    }));

    if (transactionsToAdd.length > 0) {
      await Transaction.insertMany(transactionsToAdd);
      console.log('Transactions added for friends successfully!');
    }

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Error adding transaction' });
  }
};

/**
 * עדכון Transaction קיים
 */
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { type, amount, description, category, date } = req.body;

  try {
    // מציאת הרשומה של המשתמש הראשי
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or access denied' });
    }

    // עדכון הרשומה של המשתמש הראשי
    transaction.type = type;
    transaction.amount = amount;
    transaction.description = description;
    transaction.category = category;
    transaction.date = date;
    await transaction.save();

    // עדכון כל הרשומות של החברים באותה קבוצה
    await Transaction.updateMany(
      { transactionGroupId: transaction.transactionGroupId, userId: { $ne: req.user.id } },
      { type, amount, description, category, date }
    );

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
};

/**
 * מחיקת Transaction
 */
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    // מציאת הרשומה של המשתמש הראשי
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or access denied' });
    }

    // מחיקת כל הרשומות עם אותו transactionGroupId
    await Transaction.deleteMany({ transactionGroupId: transaction.transactionGroupId });

    res.status(200).json({ message: 'Transaction and related records deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction' });
  }
};

/**
 * שליפת כל ה-Transactions של המשתמש
 */
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ userId }); // משתמש במודל במקום בסכמה
        console.log("transactions", transactions);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to get Transactions" });
    }
};


// פונקציה לחישוב סך הכל הכנסות עבור החודש הנוכחי
export const calculateTotalIncome = async (req, res) => {
  const userId = req.user.id; // הנחה שה-`user` נוסף ע"י המידלוור של האימות (authentication)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  try {
    const transactions = await Transaction.find({
      userId: userId, // מסנן רק את הנתונים של המשתמש המחובר
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
      type: 'income',
    });

    const totalIncome = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    res.json({ totalIncome });
  } catch (error) {
    console.error('Error calculating total income:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// פונקציה לחישוב סך הכל הוצאות עבור החודש הנוכחי
export const calculateTotalExpenses = async (req, res) => {
  const userId = req.user.id; // הנחה שה-`user` נוסף ע"י המידלוור של האימות (authentication)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  try {
    const transactions = await Transaction.find({
      userId: userId, // מסנן רק את הנתונים של המשתמש המחובר
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
      type: 'expense',
    });

    const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    res.json({ totalExpenses });
  } catch (error) {
    console.error('Error calculating total expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
