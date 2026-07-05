import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'], // 'income' עבור הכנסות, 'expense' עבור הוצאות
    required: true,
  },
  userId: { type: String, required: true },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  category: {
    type: String, // קטגוריה (למשל, "הוצאות קבועות", "חיסכון")
    enum: ['fixed', 'savings', 'general'],
    default: 'general',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // מזהה של המשתמש שהוסיף את הרשומה
    required: false,
  },
  transactionGroupId: { type: mongoose.Schema.Types.ObjectId, required: true } 
});

export default mongoose.model('Transaction', transactionSchema);

