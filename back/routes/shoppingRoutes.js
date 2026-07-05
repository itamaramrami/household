import express from "express";
import { addItem, getItems,deleteItem, updateItem} from '../controllers/shoppingController.js';
import auth from "../middleware/auth.js";

const router = express.Router();



router.post("/addItem", auth, addItem);
router.get("/", auth, getItems);
router.put("/:itemId",auth, updateItem);
router.delete("/:itemId",auth, deleteItem);

export default router;