const mongoose = require("mongoose");
const InsuranceSchema = new mongoose.Schema({
    user_id: String,
    provider: String,
    policyNumber: String,
    startDate: Date,
    endDate: Date,
    active: Boolean
});
module.exports = mongoose.model("Insurance", InsuranceSchema);