import express from "express";
import UserRewards from "../models/userRewards.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Initialize Gemini AI (make sure GEMINI_API_KEY is set in your .env)
const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || "AIzaSyCu3bC_nNHZSSq3zeIFm_IsDz2xFdl7Ywc"
);

// Middleware to authenticate token (assuming you have this in your main file)
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: "No token provided" });

        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, "JWT_SECRET");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

// Get user rewards
router.get("/rewards", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        let userRewards = await UserRewards.findOne({ user_id: userId });

        if (!userRewards) {
            // Create default rewards for new user
            userRewards = new UserRewards({
                user_id: userId,
                credits: 0,
                badges: []
            });
            await userRewards.save();
        }

        res.json(userRewards);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch rewards" });
    }
});

// Update user rewards
router.post("/rewards/update", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { credits, badges } = req.body;

        let userRewards = await UserRewards.findOne({ user_id: userId });

        if (!userRewards) {
            userRewards = new UserRewards({ user_id: userId });
        }

        if (credits !== undefined) userRewards.credits = credits;
        if (badges !== undefined) userRewards.badges = badges;
        userRewards.lastUpdated = new Date();

        await userRewards.save();
        res.json(userRewards);
    } catch (error) {
        res.status(500).json({ error: "Failed to update rewards" });
    }
});

// Fetch insurance plans from Gemini API
router.get("/plans", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get user rewards for discount calculation
        const userRewards = await UserRewards.findOne({ user_id: userId }) || { credits: 0, badges: [] };

        // Create Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prompt for insurance plans
        const prompt = `Generate 6 realistic insurance plans for India with the following details:
    - Plan name
    - Provider company
    - Coverage type (Health, Life, Auto, Home, Travel, or Business)
    - Premium amount in INR (between 5000 to 50000)
    - Coverage amount in INR
    - Key features (3-4 points)
    - Age group suitability
    
    Return the response as a valid JSON array with this exact structure:
    [
      {
        "planName": "string",
        "provider": "string",
        "coverageType": "string",
        "premiumAmount": number,
        "coverageAmount": number,
        "features": ["string", "string", "string"],
        "ageGroup": "string"
      }
    ]
    
    Make sure all premium amounts are realistic for Indian insurance market.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let insurancePlans;

        try {
            // Clean the response text to extract JSON
            let responseText = response.text();
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            insurancePlans = JSON.parse(responseText);
        } catch (parseError) {
            // Fallback plans if Gemini response parsing fails
            insurancePlans = [
                {
                    planName: "Health Shield Pro",
                    provider: "HDFC ERGO",
                    coverageType: "Health",
                    premiumAmount: 12000,
                    coverageAmount: 500000,
                    features: ["Cashless treatment", "Pre-existing diseases covered", "Annual health checkup"],
                    ageGroup: "25-60 years"
                },
                {
                    planName: "Life Secure Plus",
                    provider: "LIC India",
                    coverageType: "Life",
                    premiumAmount: 25000,
                    coverageAmount: 2000000,
                    features: ["Term insurance", "Accidental death benefit", "Tax benefits"],
                    ageGroup: "21-65 years"
                },
                {
                    planName: "Auto Care Complete",
                    provider: "Bajaj Allianz",
                    coverageType: "Auto",
                    premiumAmount: 8000,
                    coverageAmount: 300000,
                    features: ["Comprehensive coverage", "Zero depreciation", "Roadside assistance"],
                    ageGroup: "18+ years"
                }
            ];
        }

        // Apply reward-based discounts
        const discountedPlans = insurancePlans.map(plan => {
            const originalPrice = plan.premiumAmount;
            let discount = 0;

            // Badge discount: 100 RS per badge
            const badgeDiscount = userRewards.badges.length * 100;

            // Credit discount: 1 credit = 1 RS discount (max 20% of premium)
            const maxCreditDiscount = Math.floor(originalPrice * 0.20);
            const creditDiscount = Math.min(userRewards.credits, maxCreditDiscount);

            discount = badgeDiscount + creditDiscount;
            const finalPrice = Math.max(originalPrice - discount, Math.floor(originalPrice * 0.10)); // Minimum 10% of original price

            return {
                ...plan,
                originalPrice,
                discount,
                finalPrice,
                discountBreakdown: {
                    badgeDiscount,
                    creditDiscount,
                    totalBadges: userRewards.badges.length,
                    totalCredits: userRewards.credits
                }
            };
        });

        res.json({
            plans: discountedPlans,
            userRewards: {
                credits: userRewards.credits,
                badges: userRewards.badges.length,
                badgesList: userRewards.badges
            }
        });

    } catch (error) {
        console.error("Error fetching insurance plans:", error);
        res.status(500).json({
            error: "Failed to fetch insurance plans",
            details: error.message
        });
    }
});

// Add sample rewards for testing
router.post("/rewards/sample", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        let userRewards = await UserRewards.findOne({ user_id: userId });

        if (!userRewards) {
            userRewards = new UserRewards({ user_id: userId });
        }

        // Add sample rewards
        userRewards.credits = 500;
        userRewards.badges = ["Early Bird", "Fitness Enthusiast", "Goal Achiever"];
        userRewards.lastUpdated = new Date();

        await userRewards.save();
        res.json({ message: "Sample rewards added", rewards: userRewards });
    } catch (error) {
        res.status(500).json({ error: "Failed to add sample rewards" });
    }
});

export default router;
