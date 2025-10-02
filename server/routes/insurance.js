import express from "express";
import UserRewards from "../models/userRewards.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Default fallback insurance plans
const DEFAULT_INSURANCE_PLANS = [
    {
        planName: "Health Shield Pro",
        provider: "HDFC ERGO",
        coverageType: "Health",
        premiumAmount: 12000,
        coverageAmount: 500000,
        features: ["Cashless treatment at 10,000+ hospitals", "Pre-existing diseases covered after 2 years", "Annual health checkup included", "Maternity benefits available"],
        ageGroup: "25-60 years"
    },
    {
        planName: "Life Secure Plus",
        provider: "LIC India",
        coverageType: "Life",
        premiumAmount: 25000,
        coverageAmount: 2000000,
        features: ["Term insurance coverage", "Accidental death benefit", "Tax benefits under 80C", "Flexible premium payment options"],
        ageGroup: "21-65 years"
    },
    {
        planName: "Auto Care Complete",
        provider: "Bajaj Allianz",
        coverageType: "Auto",
        premiumAmount: 8000,
        coverageAmount: 300000,
        features: ["Comprehensive coverage", "Zero depreciation benefit", "24/7 roadside assistance", "Engine protection cover"],
        ageGroup: "18+ years"
    },
    {
        planName: "Home Guard Premium",
        provider: "ICICI Lombard",
        coverageType: "Home",
        premiumAmount: 15000,
        coverageAmount: 1000000,
        features: ["Fire and natural calamity coverage", "Burglary and theft protection", "Earthquake coverage included", "Temporary accommodation expenses"],
        ageGroup: "All ages"
    },
    {
        planName: "Travel Safe International",
        provider: "Tata AIG",
        coverageType: "Travel",
        premiumAmount: 5000,
        coverageAmount: 200000,
        features: ["Medical emergency coverage abroad", "Lost baggage protection", "Flight delay compensation", "COVID-19 coverage included"],
        ageGroup: "All ages"
    },
    {
        planName: "Business Protect Suite",
        provider: "Reliance General",
        coverageType: "Business",
        premiumAmount: 35000,
        coverageAmount: 5000000,
        features: ["Property damage coverage", "Public liability protection", "Business interruption insurance", "Employee accident coverage"],
        ageGroup: "Business owners"
    }
];

// Initialize Gemini AI with fallback handling
let genAI = null;
try {
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBE1ascpA1MTFpurd3eb6yO_RbDEYjgtuk";
    if (apiKey && apiKey !== "YOUR_API_KEY_HERE") {
        genAI = new GoogleGenerativeAI(apiKey);
    }
} catch (error) {
    console.error("Failed to initialize Gemini AI:", error.message);
}

// Middleware to authenticate token
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
        console.error("Error fetching rewards:", error);
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
        console.error("Error updating rewards:", error);
        res.status(500).json({ error: "Failed to update rewards" });
    }
});

// Fetch insurance plans with comprehensive fallback
router.get("/plans", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        let insurancePlans = [];
        let aiGenerated = false;

        // Get user rewards for discount calculation (with fallback)
        let userRewards;
        try {
            userRewards = await UserRewards.findOne({ user_id: userId }) || { credits: 0, badges: [] };
        } catch (dbError) {
            console.error("Database error fetching rewards:", dbError);
            userRewards = { credits: 0, badges: [] };
        }

        // Try to fetch from Gemini AI
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `Generate 6 realistic insurance plans for India with the following details:
    - Plan name
    - Provider company (use real Indian insurance companies)
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

                // Clean and parse the response
                let responseText = response.text();
                responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

                const parsedPlans = JSON.parse(responseText);

                // Validate the parsed plans
                if (Array.isArray(parsedPlans) && parsedPlans.length > 0) {
                    insurancePlans = parsedPlans;
                    aiGenerated = true;
                } else {
                    throw new Error("Invalid response format from AI");
                }
            } catch (aiError) {
                console.error("AI generation failed:", aiError.message);
                // Fall through to use default plans
            }
        }

        // Fallback to default plans if AI failed or not initialized
        if (insurancePlans.length === 0) {
            console.log("Using default insurance plans");
            insurancePlans = [...DEFAULT_INSURANCE_PLANS];
        }

        // Apply reward-based discounts
        const discountedPlans = insurancePlans.map(plan => {
            const originalPrice = plan.premiumAmount;
            let discount = 0;

            // Badge discount: 100 RS per badge
            const badgeDiscount = (userRewards.badges?.length || 0) * 100;

            // Credit discount: 1 credit = 1 RS discount (max 20% of premium)
            const maxCreditDiscount = Math.floor(originalPrice * 0.20);
            const creditDiscount = Math.min(userRewards.credits || 0, maxCreditDiscount);

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
                    totalBadges: userRewards.badges?.length || 0,
                    totalCredits: userRewards.credits || 0
                }
            };
        });

        res.json({
            plans: discountedPlans,
            userRewards: {
                credits: userRewards.credits || 0,
                badges: userRewards.badges?.length || 0,
                badgesList: userRewards.badges || []
            },
            dataSource: aiGenerated ? "AI-generated" : "default",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Critical error in /plans endpoint:", error);

        // Last resort fallback - return default plans without any processing
        try {
            const safePlans = DEFAULT_INSURANCE_PLANS.map(plan => ({
                ...plan,
                originalPrice: plan.premiumAmount,
                discount: 0,
                finalPrice: plan.premiumAmount,
                discountBreakdown: {
                    badgeDiscount: 0,
                    creditDiscount: 0,
                    totalBadges: 0,
                    totalCredits: 0
                }
            }));

            res.json({
                plans: safePlans,
                userRewards: {
                    credits: 0,
                    badges: 0,
                    badgesList: []
                },
                dataSource: "fallback",
                error: "Partial service degradation",
                timestamp: new Date().toISOString()
            });
        } catch (fallbackError) {
            // Absolute last resort
            res.status(500).json({
                error: "Service temporarily unavailable",
                message: "Please try again later"
            });
        }
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
        console.error("Error adding sample rewards:", error);
        res.status(500).json({ error: "Failed to add sample rewards" });
    }
});

export default router;