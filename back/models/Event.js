import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: false },
  userId: { type: String, required: true },
  eventGroupId: { type: mongoose.Schema.Types.ObjectId, required: true } 
});

export default mongoose.model('Event', eventSchema);
