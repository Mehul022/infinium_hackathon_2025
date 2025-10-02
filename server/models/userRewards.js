const mongoose = require("mongoose");
const UserRewardsSchema = new mongoose.Schema({
    user_id: String,
    credits: { type: Number, default: 0 },
    badges: [String]
});
module.exports = mongoose.model("UserRewards", UserRewardsSchema);