import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.ObjectId, ref: "users", required: true},
    name: {type: String, required: true},
    quantity: {type: Number, default: 1},
    category: {type: String, default: 'כללי'},
    unit: {type: String, default: 'יחידות'},
    isPurchased: {type: Boolean, default: false},
    itemGroupId: { type: mongoose.Schema.Types.ObjectId, required: true } 
});

export default mongoose.model("ShoppingItem", shoppingItemSchema);
