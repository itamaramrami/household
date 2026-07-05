import Savings from '../models/savingsModel.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import savingsSchema from "../models/savingsModel.js"

export const addSavings = async (req, res) => {
  const { amount, description, date } = req.body;
  try {
    const userId = req.user.id;
    const savingGroupId = new mongoose.Types.ObjectId();


    const newSavings = await Savings.create({
      userId,
      amount,
      description,
      date,
      savingGroupId
    });

    const friendEmails = req.user.friends;

    if (!friendEmails || friendEmails.length === 0) {
      return res.status(201).json(newSavings)
    }
    const friends = await User.find({ email: { $in: friendEmails } });

    const SavingsToAdd = friends.map(friend => ({
      userId: friend._id,
      amount,
      description,
      date,
      savingGroupId
    }))
    if (SavingsToAdd.length > 0) {
      await Savings.insertMany(SavingsToAdd)
      console.log('Savings added for friends successfully!');
    }
    res.status(201).json(newSavings);
  } catch (error) {
    console.error('Error adding savings:', error);
    res.status(500).json({ message: 'Error adding savings' });
  }
};

export const getSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const savings = await savingsSchema.find({ userId });
    res.json(savings);
  } catch (error) {
    console.error('Error getting savings:', error);
    res.status(500).json({ message: 'Error getting savings' });
  }
};

export const deleteSavings = async (req, res) => {
  const { id } = req.params;
  try {
    const savings = await Savings.findOne({ _id: id, userId: req.user.id });

    if (!savings) {
      return res.status(404).json({ message: 'Savings not found' });
    }
    await Savings.deleteOne({ _id: id, userId: req.user.id });
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friends = await User.find({ email: { $in: user.friends } });
    const friendIds = friends.map(friend => friend._id);

    await Savings.deleteMany({ userId: { $in: friendIds }, savingGroupId: savings.savingGroupId });
    res.status(200).json({ message: 'Savings deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings:', error);
    res.status(500).json({ message: 'Error deleting savings' });
  }
};

export const updateSavings = async (req, res) => {
  const { id } = req.params;
  const { amount, description, date } = req.body;

  try {
    const savings = await Savings.findOne({ _id: id, userId: req.user.id });

    if (!savings) {
      return res.status(404).json({ message: 'Savings not found' });
    }

    savings.amount = amount;
    savings.description = description;
    savings.date = date;
    await savings.save();

    const user = await User.findById(req.user.id);
    const friendEmails = user.friends;
    if (friendEmails && friendEmails.length > 0) {
      const friends = await User.find({ email: { $in: friendEmails } });
      const friendIds = friends.map(friend => friend._id);
      await Savings.updateMany(
        { userId: { $in: friendIds }, savingGroupId: savings.savingGroupId },
        { amount, description, date }
      );
    }

    res.status(200).json(savings);
  } catch (error) {
    console.error('Error updating savings:', error);
    res.status(500).json({ message: 'Error updating savings' });
  }
};


// פונקציה לחישוב סך הכל חסכונות עבור החודש הנוכחי
export const calculateTotalSavings = async (req, res) => {
  const userId = req.user.id; // הנחה שה-`user` נוסף ע"י המידלוור של האימות (authentication)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  try {
    const savings = await Savings.find({
      userId: userId, // מסנן רק את הנתונים של המשתמש המחובר
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);
    res.json({ totalSavings });
  } catch (error) {
    console.error('Error calculating total savings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
