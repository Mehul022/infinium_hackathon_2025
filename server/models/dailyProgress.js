import mongoose from "mongoose";

const DailyProgressSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    tasks: [
        {
            name: { type: String, required: true },
            description: { type: String, default: "" },
            completed: { type: Boolean, default: false },
            isHeartTask: { type: Boolean, default: false },
            percentage: { type: Number, default: 0 }
        }
    ],
    steps: { type: Number, default: 0 },
    moveMinutes: { type: Number, default: 0 },
    briskWalkMinutes: { type: Number, default: 0 },
    lightJogMinutes: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

// Ensure only one heart task
DailyProgressSchema.pre("save", function (next) {
    const heartTasks = this.tasks.filter(t => t.isHeartTask);
    if (heartTasks.length > 1) {
        return next(new Error("Only one task can be marked as heart task per day."));
    }

    this.tasks.forEach(task => {
        if (task.percentage >= 100) task.completed = true;
    });

    next();
});

export default mongoose.model("DailyProgress", DailyProgressSchema);
