import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // מזהה שולח הבקשה
  senderEmail: { type: String, required: true }, // מייל שולח הבקשה

  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // מזהה מקבל הבקשה
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // סטטוס הבקשה
  createdAt: { type: Date, default: Date.now }, // מתי הבקשה נוצרה
});

export default mongoose.model('FriendRequest', friendRequestSchema);
