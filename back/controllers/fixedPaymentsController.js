import FixedPayments from '../models/fixedPaymentsModel.js';
import fixedPaymentsSchema from "../models/fixedPaymentsModel.js"
import User from '../models/user.model.js';
import mongoose from 'mongoose';


export const addFixedPayment = async (req, res) => {
  const { amount, description, date } = req.body;
  try {
    const userId = req.user.id;


    const fixedGroupId = new mongoose.Types.ObjectId();


    const newFixedPayment = await FixedPayments.create({ userId, amount, description, date ,fixedGroupId});

    const friendEmails = req.user.friends;
    if (!friendEmails || friendEmails.length === 0) {
      return res.status(201).json(newFixedPayment);
    }
    const friends = await User.find({ email: { $in: friendEmails } });


    const fixedToAdd = friends.map(friend => ({
      userId: friend._id,
      amount,
       description,
        date ,
        fixedGroupId

    }));
    if (fixedToAdd.length > 0) {
      await FixedPayments.insertMany(fixedToAdd);
      console.log("fixed added for friends successfully!");
    }
    res.status(201).json(newFixedPayment);
  } catch (error) {
    console.error('Error adding fixed payment:', error);
    res.status(500).json({ message: 'Error adding fixed payment' });
  }
};

export const getFixedPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const fixedPayments = await fixedPaymentsSchema.find({ userId });
    res.json(fixedPayments);
  } catch (error) {
    console.error('Error getting fixed payments:', error);
    res.status(500).json({ message: 'Error getting fixed payments' });
  }
};

export const deleteFixedPayment = async (req, res) => {
  const { id } = req.params;
  try {
    const fixedPayment = await FixedPayments.findOne({ _id: id, userId: req.user.id });

    if (!fixedPayment) {
      return res.status(404).json({ message: 'Fixed payment not found' });
    }

    await FixedPayments.deleteOne({ _id: id, userId: req.user.id });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friends = await User.find({ email: { $in: user.friends } });
    const friendIds = friends.map(friend => friend._id);

    await FixedPayments.deleteMany({ userId: { $in: friendIds }, fixedGroupId: fixedPayment.fixedGroupId });


    res.status(200).json({ message: 'Fixed payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting fixed payment:', error);
    res.status(500).json({ message: 'Error deleting fixed payment' });
  }
};

export const updateFixedPayment = async (req, res) => {
  const { id } = req.params;
  const { amount, description, date } = req.body;

  try {
    const fixedPayment = await FixedPayments.findOne({ _id: id, userId: req.user.id });

    if (!fixedPayment) {
      return res.status(404).json({ message: 'Fixed payment not found' });
    }

    fixedPayment.amount = amount;
    fixedPayment.description = description;
    fixedPayment.date = date;

    await fixedPayment.save();


    const user = await User.findById(req.user.id);
    const friendEmails = user.friends;
    if (friendEmails && friendEmails.length > 0) {
      const friends = await User.find({ email: { $in: friendEmails } });
      const friendIds = friends.map(friend => friend._id);

      await FixedPayments.updateMany(
        { userId: { $in: friendIds }, fixedGroupId: fixedPayment.fixedGroupId },
        { amount, description, date}
      );
    }

    res.status(200).json(fixedPayment);
  } catch (error) {
    console.error('Error updating fixed payment:', error);
    res.status(500).json({ message: 'Error updating fixed payment' });
  }
};


// פונקציה לחישוב סך הכל תשלומים קבועים עבור החודש הנוכחי
export const calculateTotalFixedPayments = async (req, res) => {
  const userId = req.user.id; // הנחה שה-`user` נוסף ע"י המידלוור של האימות (authentication)

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  try {
    const fixedPayments = await fixedPaymentsSchema.find({
      userId: userId, // מסנן רק את הנתונים של המשתמש המחובר
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const totalFixedPayments = fixedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    res.json({ totalFixedPayments });
  } catch (error) {
    console.error('Error calculating total fixed payments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
