import User from "../models/user.model.js";
import shoppingItemSchema from "../models/shoppingItemModel.js";
import mongoose from "mongoose";

export const addItem = async (req, res) => {
    try {
        const { name, quantity, category, unit } = req.body;

        const itemGroupId = new mongoose.Types.ObjectId();

        if (!name || !quantity) {
            return res.status(400).json({ error: "הכנס שם וכמות" });
        }

        const userId = req.user.id;
        const newItem = await shoppingItemSchema.create({ 
            userId,
            name,
            quantity,
            category: category || 'כללי',
            unit: unit || 'יחידות',
            itemGroupId 
        });

        const friendEmail = req.user.friends;
        if (!friendEmail || friendEmail.length === 0) {
            return res.status(201).json(newItem);
        }
        const friends = await User.find({ email: { $in: friendEmail }});

        const itemToAdd = friends.map(friend => ({
            userId: friend._id,
            name,
            quantity,
            category: category || 'כללי',
            unit: unit || 'יחידות',
            itemGroupId
        }));

        if (itemToAdd.length > 0) {
            await shoppingItemSchema.insertMany(itemToAdd);
        }

        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to add item" });
    }
};

export const updateItem = async (req, res) => {
    const { itemId } = req.params;
    const { name, quantity, category, unit, isPurchased } = req.body;
    const userId = req.user.id;

    try {
        const item = await shoppingItemSchema.findOne({ _id: itemId, userId: userId });
        if (!item) {
            return res.status(404).json({ message: "item not found" });
        }

        item.name = name;
        item.quantity = quantity;
        item.category = category || 'כללי';
        item.unit = unit || 'יחידות';
        item.isPurchased = isPurchased;
        
        await item.save();

        const { itemGroupId } = item;

        const user = await User.findById(userId);
        const friendEmails = user.friends;

        if (friendEmails) {
            const friends = await User.find({ email: { $in: friendEmails } });
            const friendIds = friends.map(friend => friend._id);

            await shoppingItemSchema.updateMany(
                { userId: { $in: friendIds }, itemGroupId },
                { 
                    name, 
                    quantity, 
                    category: category || 'כללי',
                    unit: unit || 'יחידות',
                    isPurchased 
                }
            );
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to update item" });
    }
};

export const getItems = async (req, res) =>{
    try {
        const userId = req.user.id;
        const items = await shoppingItemSchema.find({ userId });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.massage || "Failed to get items" })
    }
}


export const deleteItem = async (req, res) => {
    try {
    const  userId  = req.user.id;
    const { itemId } = req.params;

    const user = await User.findById(userId)
    if (!user){
        return res.status(404).json( { massage: "User not found" });
    }

    const friends = await User.find( {email: {$in: user.friends}})

    const friendsIds = friends.map(friend => friend.id)

    const item = await shoppingItemSchema.findOne( {_id: itemId,userId: userId})
    if (!item) {
        return res.status(404).json({ massage: "Item not found or access denied" });
    }
    const { itemGroupId } = item;

    await shoppingItemSchema.deleteOne( {_id: itemId,userId: userId})

    await shoppingItemSchema.deleteMany({userId: {$in: friendsIds},itemGroupId})
    

    res.status(200).json({ massage: "Item deleted successfully from all users" });
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message || "Failed to delete item" });
    }
}





