import mongoose from 'mongoose';

const savingsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: false },
  date: { type: Date, default: Date.now },
  savingGroupId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

export default mongoose.model('Savings', savingsSchema);
