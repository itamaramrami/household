import express from "express";
import { addTask, deleteTask, getAllTasks, updateTask} from '../controllers/taskController.js';
import auth from "../middleware/auth.js";

const router = express.Router();



router.post("/add", auth, addTask);
router.get("/", auth, getAllTasks);
router.put("/:taskId",auth, updateTask);
router.delete("/:taskId",auth, deleteTask);

export default router;