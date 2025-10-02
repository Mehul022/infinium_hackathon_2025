const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { execSync } = require('child_process');
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const onnx = require("onnxruntime-node");
const sharp = require("sharp"); // For image processing

// Import models
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB connection
mongoose.connect("mongodb+srv://mehulag022_db_user:ejW49KI6Tg5Of9G9@infiniumhack2025.j1lc9uo.mongodb.net/?retryWrites=true&w=majority&appName=infiniumhack2025")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    
    const decoded = jwt.verify(token, "JWT_SECRET");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Register route
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "A user with this email already exists" });
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password_hash: hashedPassword,
      role: role || 'Staff',
      created_at: new Date(),
      last_login: null
    });
    await user.save();
    const token = jwt.sign({ userId: user.user_id, role: user.role }, "JWT_SECRET", { expiresIn: "1d" });
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    // Handle MongoDB duplicate key error explicitly
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(400).json({ error: "A user with this email already exists" });
      } else if (error.keyPattern.username) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }
    res.status(400).json({ error: error.message });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Allow login with either username or email
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    } else {
      return res.status(400).json({ error: "Please provide either username or email" });
    }
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Update last login
    user.last_login = new Date();
    await user.save();
    
    const token = jwt.sign({ 
      userId: user.user_id, 
      role: user.role,
      username: user.username,
      email: user.email
    }, "JWT_SECRET", { expiresIn: "1d" });
    
    res.json({ 
      success: true, 
      token, 
      role: user.role,
      userId: user.user_id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user profile
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/protected", (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, "JWT_SECRET");
    res.json({ message: "This is protected data", user: decoded.userId });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(3000, '0.0.0.0', () => {
  console.log('Server accessible at:');
  console.log('- Ethernet: http://10.1.131.111:3000');
  console.log('- Wi-Fi: http://10.42.0.1:3000');
});