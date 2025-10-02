import mongoose from "mongoose";
const UserRewardsSchema = new mongoose.Schema({
    user_id: String,
    credits: { type: Number, default: 0 },
    badges: [String]
});
export default mongoose.model("UserRewards", UserRewardsSchema);
