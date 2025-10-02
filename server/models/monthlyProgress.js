const mongoose = require("mongoose");
const MonthlyProgressSchema = new mongoose.Schema({
    user_id: String,
    month: String, // "2025-10"
    days: [
        {
            day: Number, // 1–31
            completedTasks: Number,
            percentage: Number
        }
    ]
});
module.exports = mongoose.model("MonthlyProgress", MonthlyProgressSchema);