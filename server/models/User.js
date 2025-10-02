const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password_hash: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['doctor', 'Manager', 'Staff'],
    default: 'Staff'
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  last_login: { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: false
});

// Define all indexes explicitly to avoid duplicates
userSchema.index({ user_id: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);