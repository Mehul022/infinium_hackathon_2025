const mongoose = require("mongoose");
const DailyProgressSchema = new mongoose.Schema({
    user_id: String,
    task1: { type: Number, default: 0 }, // 0 = not done, 1 = done
    task2: { type: Number, default: 0 },
    task3: { type: Number, default: 0 },
    task4: { type: Number, default: 0 },
    task5: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model("DailyProgress", DailyProgressSchema);