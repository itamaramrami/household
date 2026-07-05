import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: "",
        },
        dueDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Completed'],
            default: 'Open'
        },
        assignee: {
            email: String,
            name: String
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium'
        },
        taskGroupId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);