import React, { useEffect, useState } from "react";
import "./ProfilePage.css";

export default function ProfileScreen() {
    const [profile, setProfile] = useState(null);
    const [showDetailedProfile, setShowDetailedProfile] = useState(false);

    useEffect(() => {
        fetchProfile();
        setupDailyReset();
    }, []);

    const fetchProfile = async () => {
        try {
            // For demo purposes, using mock data since we don't have AsyncStorage in web
            const mockProfile = {
                user: {
                    username: "Aryan agrawal",
                    phone: "9950451628",
                    initials: "AA",
                    email: "aryan@example.com",
                    created_at: "2024-01-15T00:00:00Z",
                    last_login: "2024-10-02T08:30:00Z"
                },
                daily: {
                    task1: true,
                    task2: false,
                    task3: true,
                    task4: false,
                    task5: true
                },
                monthly: {
                    days: [
                        { completedTasks: 5 }, { completedTasks: 3 }, { completedTasks: 5 }, { completedTasks: 2 },
                        { completedTasks: 5 }, { completedTasks: 4 }, { completedTasks: 5 }, { completedTasks: 1 },
                        { completedTasks: 5 }, { completedTasks: 5 }, { completedTasks: 3 }, { completedTasks: 5 },
                        { completedTasks: 2 }, { completedTasks: 5 }, { completedTasks: 5 }, { completedTasks: 4 },
                        { completedTasks: 5 }, { completedTasks: 3 }, { completedTasks: 5 }, { completedTasks: 5 },
                        { completedTasks: 1 }, { completedTasks: 5 }, { completedTasks: 4 }, { completedTasks: 5 },
                        { completedTasks: 5 }, { completedTasks: 2 }, { completedTasks: 5 }, { completedTasks: 5 },
                        { completedTasks: 3 }, { completedTasks: 5 }
                    ]
                },
                insurance: [
                    { active: true, type: "Health" },
                    { active: false, type: "Auto" },
                    { active: true, type: "Life" }
                ]
            };
            setProfile(mockProfile);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const setupDailyReset = () => {
        const now = new Date();
        const millisTillMidnight =
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;

        setTimeout(() => {
            resetDailyTasks();
            setupDailyReset();
        }, millisTillMidnight);
    };

    const resetDailyTasks = () => {
        setProfile(prev => ({
            ...prev,
            daily: { task1: false, task2: false, task3: false, task4: false, task5: false }
        }));
    };

    const handleLogout = () => {
        alert("Logout functionality - would redirect to login page");
    };

    const navigateToDaily = () => {
        alert("Would navigate to Daily Tasks page");
    };

    const navigateToMonthly = () => {
        alert("Would navigate to Monthly Progress page");
    };

    const navigateToInsurance = () => {
        alert("Would navigate to Insurance page");
    };

    const navigateToHome = () => {
        alert("Would navigate to Home page");
    };

    const showProfileDetails = () => {
        setShowDetailedProfile(true);
    };

    const backToMainProfile = () => {
        setShowDetailedProfile(false);
    };

    if (!profile) return <div className="loading">Loading profile...</div>;

    const totalTasks = Object.keys(profile.daily || {}).length;
    const completedTasks = Object.values(profile.daily || {}).filter(Boolean).length;
    const dailyProgress = totalTasks ? completedTasks / totalTasks : 0;

    console.log('Progress Debug:', { totalTasks, completedTasks, dailyProgress });

    const totalDays = profile.monthly?.days?.length || 0;
    const completedDays = profile.monthly?.days?.filter(d => d.completedTasks === 5).length || 0;
    const monthlyProgress = totalDays ? completedDays / totalDays : 0;

    // Calculate weekly progress (last 7 days)
    const weeklyDays = profile.monthly?.days?.slice(-7) || [];
    const weeklyCompletedDays = weeklyDays.filter(d => d.completedTasks === 5).length;
    const weeklyProgress = weeklyDays.length ? weeklyCompletedDays / weeklyDays.length : 0;

    const totalInsurance = profile.insurance?.length || 0;
    const activeInsurance = profile.insurance?.filter(ins => ins.active).length || 0;

    // Render detailed profile view
    if (showDetailedProfile) {
        return (
            <div className="container">
                {/* Header with back button */}
                <div className="header">
                    <button className="back-button" onClick={backToMainProfile}>
                        ←
                    </button>
                    <h2 className="page-title">Profile Details</h2>
                </div>

                {/* Personal Information */}
                <div className="profile-card detailed">
                    <div className="section-header">
                        <h3>👤 Personal Information</h3>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Full Name:</span>
                        <span className="detail-value">{profile.user.username}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{profile.user.phone}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{profile.user.email}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Member Since:</span>
                        <span className="detail-value">{new Date(profile.user.created_at).toDateString()}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Last Login:</span>
                        <span className="detail-value">{new Date(profile.user.last_login).toDateString()}</span>
                    </div>
                </div>

                {/* Progress Tracking */}
                <div className="progress-section">
                    <h3 className="section-title">📊 Progress Overview</h3>
                    
                    {/* Daily Progress */}
                    <div className="progress-card">
                        <div className="progress-header">
                            <h4>📅 Daily Progress</h4>
                            <span className="progress-percentage">{Math.round(dailyProgress * 100)}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${dailyProgress * 100}%` }}></div>
                        </div>
                        <p className="progress-text">{completedTasks} out of {totalTasks} tasks completed today</p>
                    </div>

                    {/* Weekly Progress */}
                    <div className="progress-card">
                        <div className="progress-header">
                            <h4>📈 Weekly Progress</h4>
                            <span className="progress-percentage">{Math.round(weeklyProgress * 100)}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar weekly" style={{ width: `${weeklyProgress * 100}%` }}></div>
                        </div>
                        <p className="progress-text">{weeklyCompletedDays} out of {weeklyDays.length} days completed this week</p>
                    </div>

                    {/* Monthly Progress */}
                    <div className="progress-card">
                        <div className="progress-header">
                            <h4>🗓️ Monthly Progress</h4>
                            <span className="progress-percentage">{Math.round(monthlyProgress * 100)}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar monthly" style={{ width: `${monthlyProgress * 100}%` }}></div>
                        </div>
                        <p className="progress-text">{completedDays} out of {totalDays} days completed this month</p>
                    </div>
                </div>

                {/* Insurance Summary */}
                <div className="profile-card">
                    <div className="section-header">
                        <h3>💼 Insurance Overview</h3>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Active Policies:</span>
                        <span className="detail-value">{activeInsurance}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Total Policies:</span>
                        <span className="detail-value">{totalInsurance}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Main profile view
    return (
        <div className="container">
            {/* Header with back button */}
            <div className="header">
                <button className="back-button" onClick={navigateToHome}>
                    ←
                </button>
            </div>

            {/* Profile Section */}
            <div className="profile-section">
                <div className="profile-card">
                    {/* Circular Progress Avatar */}
                    <div className="avatar-container">
                        <div className="circular-progress">
                            <svg width="120" height="120" className="progress-ring">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="#e6f3ff"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="#007bff"
                                    strokeWidth="8"
                                    strokeDasharray={`${dailyProgress * 314} 314`}
                                    strokeDashoffset="78.5"
                                    transform="rotate(-90 60 60)"
                                    className="progress-circle"
                                />
                            </svg>
                            <div className="avatar">
                                <span className="initials">{profile.user.initials}</span>
                            </div>
                            <div className="progress-badge">
                                <span className="progress-text">{Math.round(dailyProgress * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="user-details">
                        <h2 className="user-name">{profile.user.username}</h2>
                        <p className="user-phone">{profile.user.phone}</p>
                        
                        {/* Quick Progress Summary */}
                        <div className="quick-progress">
                            <div className="progress-item">
                                <span className="progress-label">Daily: {completedTasks}/{totalTasks} tasks completed</span>
                                <div className="mini-progress-bar">
                                    <div className="mini-progress-fill" style={{ width: `${dailyProgress * 100}%` }}></div>
                                </div>
                                <span className="progress-percentage">{Math.round(dailyProgress * 100)}%</span>
                            </div>
                            <div className="progress-item">
                                <span className="progress-label">Weekly: {weeklyCompletedDays}/{weeklyDays.length} days completed</span>
                                <div className="mini-progress-bar">
                                    <div className="mini-progress-fill weekly" style={{ width: `${weeklyProgress * 100}%` }}></div>
                                </div>
                                <span className="progress-percentage">{Math.round(weeklyProgress * 100)}%</span>
                            </div>
                            <div className="progress-item">
                                <span className="progress-label">Monthly: {completedDays}/{totalDays} days completed</span>
                                <div className="mini-progress-bar">
                                    <div className="mini-progress-fill monthly" style={{ width: `${monthlyProgress * 100}%` }}></div>
                                </div>
                                <span className="progress-percentage">{Math.round(monthlyProgress * 100)}%</span>
                            </div>
                        </div>
                        
                        <button className="view-profile-btn" onClick={showProfileDetails}>
                            View your profile →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}