import mongoose from 'mongoose';

const fixedPaymentsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: false },
  date: { type: Date, default: Date.now },
  fixedGroupId: { type: mongoose.Schema.Types.ObjectId, required: true } 
});

export default mongoose.model('FixedPayments', fixedPaymentsSchema);
