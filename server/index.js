// Import libraries (ESM style)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { execSync, exec } from "child_process";
import path from "path";
import fs from "fs";
import onnx from "onnxruntime-node";
import sharp from "sharp"; // For image processing
import cron from "node-cron";
import { GoogleGenAI } from "@google/genai";

// Import models
import User from "./models/User.js";
import UserRewards from "./models/userRewards.js";
import DailyProgress from "./models/dailyProgress.js";
import MonthlyProgress from "./models/monthlyProgress.js";
import Insurance from "./models/insurance.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Gemini client
const ai = new GoogleGenAI({ apiKey: "AIzaSyCu3bC_nNHZSSq3zeIFm_IsDz2xFdl7Ywc" });

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://mehulag022_db_user:ejW49KI6Tg5Of9G9@infiniumhack2025.j1lc9uo.mongodb.net/?retryWrites=true&w=majority&appName=infiniumhack2025"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ------------------- CRON for Daily Tasks -------------------
cron.schedule("0 0 * * *", async () => {
  try {
    const users = await User.find({});

    for (const user of users) {
      // ---------------- Generate new daily tasks ----------------
      const tasks = [];
      const heartTaskIndex = Math.floor(Math.random() * 4) + 1; // task2–5
      const stepsGoal = 10000;
      const initialSteps = Math.floor(Math.random() * stepsGoal);

      // Task1 fixed (steps goal)
      tasks.push({
        name: "task1",
        description: "Complete 10,000 steps today",
        completed: initialSteps >= stepsGoal,
        isHeartTask: false,
        percentage: Math.min(100, Math.round((initialSteps / stepsGoal) * 100))
      });

      // --------- LLM call to Gemini for 4 fitness tasks ---------
      let generatedTasks = [];
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Generate 4 short one-line daily fitness tasks. Keep them concise like: "Do 20 pushups", "Drink 2L water".`
        });

        // Split response by line
        generatedTasks = response.response.text()
          .split("\n")
          .map(t => t.replace(/^\d+\.\s*/, "").trim())
          .filter(t => t.length > 0)
          .slice(0, 4); // Only 4 tasks
      } catch (err) {
        console.error("LLM API error:", err.message);
        generatedTasks = ["Do 20 pushups", "Drink 2L water", "Stretch for 10 mins", "Meditate 5 mins"];
      }

      // Tasks 2–5
      for (let i = 0; i < 4; i++) {
        const percentage = Math.floor(Math.random() * 101); // 0–100%
        tasks.push({
          name: `task${i + 2}`,
          description: generatedTasks[i] || `Task ${i + 2}`,
          completed: percentage === 100,
          isHeartTask: (i + 1) === heartTaskIndex,
          percentage
        });
      }

      // ---------------- Save Daily Progress ----------------
      const newDaily = new DailyProgress({
        user_id: user.user_id,
        tasks,
        steps: initialSteps,
        moveMinutes: Math.floor(Math.random() * 60),
        briskWalkMinutes: Math.floor(Math.random() * 30),
        lightJogMinutes: Math.floor(Math.random() * 30),
        date: new Date()
      });
      await newDaily.save();

      // ---------------- Update Monthly Progress ----------------
      const today = new Date();
      const month = today.toISOString().slice(0, 7);
      let monthly = await MonthlyProgress.findOne({ user_id: user.user_id, month });
      if (!monthly) monthly = new MonthlyProgress({ user_id: user.user_id, month, days: [] });

      const dayNumber = today.getDate();
      monthly.days = monthly.days.filter(d => d.day !== dayNumber);

      const completedTasks = tasks.filter(t => t.completed).length;
      const dayPercentage = Math.round(tasks.reduce((sum, t) => sum + t.percentage, 0) / tasks.length);

      monthly.days.push({
        day: dayNumber,
        completedTasks,
        percentage: dayPercentage
      });

      monthly.days.sort((a, b) => a.day - b.day);
      await monthly.save();

      // ---------------- Update Rewards ----------------
      let userRewards = await UserRewards.findOne({ user_id: user.user_id });
      if (!userRewards) userRewards = new UserRewards({ user_id: user.user_id, credits: 0, badges: [] });

      tasks.forEach(task => {
        if (task.percentage >= 100 && !userRewards.badges.includes(`${task.name} Completed ✅`)) {
          userRewards.badges.push(`${task.name} Completed ✅`);
          userRewards.credits += 10;
        } else if (task.percentage > 50) {
          userRewards.credits += 5;
        }
      });

      const last7Days = monthly.days.slice(-7);
      const avg7Days = last7Days.reduce((sum, d) => sum + d.percentage, 0) / last7Days.length;
      if (avg7Days >= 80 && !userRewards.badges.includes("7-Day Streak 🌟")) {
        userRewards.badges.push("7-Day Streak 🌟");
        userRewards.credits += 20;
      }

      const monthlyAvg = monthly.days.reduce((sum, d) => sum + d.percentage, 0) / monthly.days.length;
      if (monthlyAvg >= 80 && !userRewards.badges.includes("Monthly Champion 🏆")) {
        userRewards.badges.push("Monthly Champion 🏆");
        userRewards.credits += 50;
      }

      await userRewards.save();
    }

    console.log("✅ Daily tasks regenerated, monthly updated, and rewards applied at midnight.");
  } catch (err) {
    console.error("Error generating daily tasks:", err);
  }
});


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

app.get("/api/user/fullProfile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ user_id: userId });
    const rewards = await UserRewards.findOne({ user_id: userId });
    const daily = await DailyProgress.findOne({ user_id: userId }).sort({ date: -1 });
    const monthly = await MonthlyProgress.findOne({ user_id: userId }).sort({ month: -1 });
    const insurance = await Insurance.find({ user_id: userId });

    res.json({
      user,
      rewards,
      daily,
      monthly,
      insurance
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/user/details", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch user from database
    const user = await User.findOne({ user_id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prepare response
    const userDetails = {
      username: user.username || "User",
      phone: user.phone || "N/A",
      email: user.email || "N/A",
      created_at: user.createdAt || new Date().toISOString(),
      last_login: user.lastLogin || new Date().toISOString(),
    };

    console.log("User Details Response:", userDetails);
    res.json(userDetails);
  } catch (err) {
    console.error("Error in /api/user/details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/user/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();

    // Fetch user
    const user = await User.findOne({ user_id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch daily progress for today
    const daily = await DailyProgress.findOne({
      user_id: userId,
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    // Fetch last 7 days progress
    let last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const targetDay = new Date();
      targetDay.setDate(today.getDate() - i);

      const monthStr = targetDay.toISOString().slice(0, 7); // YYYY-MM
      const dayNum = targetDay.getDate();

      const monthly = await MonthlyProgress.findOne({
        user_id: userId,
        month: monthStr
      });

      const dayData = monthly?.days?.find(d => d.day === dayNum);
      const completedTasks = dayData?.completedTasks || 0;

      last7Days.push({
        date: targetDay.toISOString(),
        day: targetDay.toLocaleDateString('en-US', { weekday: 'short' }),
        completedTasks: completedTasks,
        // Progress value between 0-1 for visualization (max 5 tasks per day)
        completed: Math.min(completedTasks / 5, 1)
      });
    }

    // Calculate heart points from last 30 days
    let totalCompletedLast30Days = 0;
    for (let i = 0; i < 30; i++) {
      const targetDay = new Date();
      targetDay.setDate(today.getDate() - i);

      const monthStr = targetDay.toISOString().slice(0, 7);
      const dayNum = targetDay.getDate();

      const monthly = await MonthlyProgress.findOne({
        user_id: userId,
        month: monthStr
      });

      const dayData = monthly?.days?.find(d => d.day === dayNum);
      totalCompletedLast30Days += dayData?.completedTasks || 0;
    }

    // Heart points = sum of completed tasks in last 30 days / 5
    const heartPts = Math.floor(totalCompletedLast30Days / 2);

    // Prepare daily progress
    const dailyData = {
      steps: daily?.steps || 0,
      calories: daily?.calories || Math.round((daily?.steps || 0) * 0.04),
      distance: daily?.distance || +((daily?.steps || 0) * 0.0008).toFixed(2),
      tasks: daily?.tasks || [],
      heartPts,
      heartPtsGoal: 30,
      moveMinutes: daily?.moveMinutes || 0,
      briskWalkMinutes: daily?.briskWalkMinutes || 0,
      lightJogMinutes: daily?.lightJogMinutes || 0,
      activityMinutes: daily?.activityMinutes || 0
    };

    const rewards = await UserRewards.findOne({ user_id: userId });

    const responseData = {
      username: user.username,
      dailyProgress: dailyData,
      weeklyProgress: last7Days,
      rewardPoints: rewards?.credits || 0
    };

    console.log("User Progress Response:", JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check for existing user
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: "A user with this email already exists" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ error: "Username already taken" });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password_hash: hashedPassword,
      created_at: new Date(),
      last_login: null
    });
    await user.save();

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, email: user.email },
      "JWT_SECRET",
      { expiresIn: "1d" }
    );

    // ---------------- Initialize Daily Progress ----------------
    const tasks = [];
    const heartTaskIndex = Math.floor(Math.random() * 4) + 1; // task2–5
    const stepsGoal = 10000;
    const initialSteps = Math.floor(Math.random() * stepsGoal);

    // Task1 fixed: 10,000 steps
    tasks.push({
      name: "task1",
      description: "Complete 10,000 steps today",
      completed: initialSteps >= stepsGoal,
      isHeartTask: false,
      percentage: Math.min(100, Math.round((initialSteps / stepsGoal) * 100))
    });

    // --------- LLM call to Gemini for 4 fitness tasks ---------
    let generatedTasks = [];
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate 4 short one-line daily fitness tasks. Keep them concise like: "Do 20 pushups", "Drink 2L water".`
      });

      generatedTasks = response.response.text()
        .split("\n")
        .map(t => t.replace(/^\d+\.\s*/, "").trim())
        .filter(t => t.length > 0)
        .slice(0, 4);
    } catch (err) {
      console.error("LLM API error:", err.message);
      generatedTasks = ["Do 20 pushups", "Drink 2L water", "Stretch for 10 mins", "Meditate 5 mins"];
    }

    // Tasks 2–5
    for (let i = 0; i < 4; i++) {
      const percentage = Math.floor(Math.random() * 101); // 0–100%
      tasks.push({
        name: `task${i + 2}`,
        description: generatedTasks[i] || `Task ${i + 2}`,
        completed: percentage === 100,
        isHeartTask: (i + 1) === heartTaskIndex,
        percentage
      });
    }

    const dailyProgress = new DailyProgress({
      user_id: user.user_id,
      tasks,
      steps: initialSteps,
      moveMinutes: Math.floor(Math.random() * 60),
      briskWalkMinutes: Math.floor(Math.random() * 30),
      lightJogMinutes: Math.floor(Math.random() * 30)
    });
    await dailyProgress.save();

    // ---------------- Initialize Monthly Progress ----------------
    const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const days = Array.from({ length: 30 }, (_, i) => {
      const completedTasks = Math.floor(Math.random() * 6); // 0–5
      return {
        day: i + 1,
        completedTasks,
        percentage: Math.round((completedTasks / 5) * 100)
      };
    });

    const monthlyProgress = new MonthlyProgress({
      user_id: user.user_id,
      month,
      days
    });
    await monthlyProgress.save();

    // ---------------- Initialize User Rewards ----------------
    let credits = 0;
    const badges = [];

    // Daily tasks rewards
    tasks.forEach(task => {
      if (task.percentage >= 100) {
        credits += 10;
        if (!badges.includes(`${task.name} Completed ✅`)) badges.push(`${task.name} Completed ✅`);
      } else if (task.percentage > 50) {
        credits += 5;
      }
    });

    // Reward for last 7 days > 80% (simulated on registration)
    const last7DaysAvg = days.slice(-7).reduce((sum, d) => sum + d.percentage, 0) / 7;
    if (last7DaysAvg >= 80) {
      credits += 20;
      badges.push("7-Day Streak 🌟");
    }

    // Reward for monthly average > 80%
    const monthlyAvg = days.reduce((sum, d) => sum + d.percentage, 0) / days.length;
    if (monthlyAvg >= 80) {
      credits += 50;
      badges.push("Monthly Champion 🏆");
    }

    const userRewards = new UserRewards({
      user_id: user.user_id,
      credits,
      badges
    });
    await userRewards.save();

    // ---------------- Return response ----------------
    res.json({ success: true, token });

  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email) return res.status(400).json({ error: "A user with this email already exists" });
      if (error.keyPattern.username) return res.status(400).json({ error: "Username already taken" });
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

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, email: user.email },
      "JWT_SECRET",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
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