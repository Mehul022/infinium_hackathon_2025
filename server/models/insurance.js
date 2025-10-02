import mongoose from "mongoose";
const InsuranceSchema = new mongoose.Schema({
    user_id: String,
    provider: String,
    policyNumber: String,
    startDate: Date,
    endDate: Date,
    active: Boolean
});
export default mongoose.model("Insurance", InsuranceSchema);