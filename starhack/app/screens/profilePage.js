import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../core/theme";

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showDetailedProfile, setShowDetailedProfile] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                navigation.replace("StartScreen");
                return;
            }

            const response = await fetch("http://10.231.48.49:3000/api/user/progress", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (response.status !== 200) {
                Alert.alert("Error", data.error || "Failed to fetch profile");
                return;
            }

            // Fetch user details
            const userResponse = await fetch("http://10.231.48.49:3000/api/user/details", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const userData = await userResponse.json();

            // Combine data
            const combinedProfile = {
                user: {
                    username: data.username || userData.username || "User",
                    phone: userData.phone || "N/A",
                    email: userData.email || "N/A",
                    initials: getInitials(data.username || userData.username || "User"),
                    created_at: userData.created_at || new Date().toISOString(),
                    last_login: userData.last_login || new Date().toISOString()
                },
                daily: data.dailyProgress || {},
                weekly: data.weeklyProgress || [],
                rewardPoints: data.rewardPoints || 0
            };

            setProfile(combinedProfile);
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert("Error", "Failed to load profile. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem("token");
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "StartScreen" }]
                        });
                    }
                }
            ]
        );
    };

    const calculateDailyProgress = () => {
        if (!profile?.daily?.tasks) return 0;
        const tasks = profile.daily.tasks;
        const completed = tasks.filter(t => t.completed).length;
        return tasks.length > 0 ? completed / tasks.length : 0;
    };

    const calculateWeeklyProgress = () => {
        if (!profile?.weekly || profile.weekly.length === 0) return 0;
        const completedDays = profile.weekly.filter(d => d.completedTasks === 5).length;
        return completedDays / profile.weekly.length;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const dailyProgress = calculateDailyProgress();
    const weeklyProgress = calculateWeeklyProgress();
    const completedTasks = profile.daily?.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = profile.daily?.tasks?.length || 5;
    const weeklyCompletedDays = profile.weekly?.filter(d => d.completedTasks === 5).length || 0;
    const weeklyTotalDays = profile.weekly?.length || 7;

    // Detailed Profile View
    if (showDetailedProfile) {
        return (
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setShowDetailedProfile(false)}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile Details</Text>
                    <View style={styles.backButton} />
                </View>

                {/* Personal Information */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>👤 Personal Information</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Full Name:</Text>
                        <Text style={styles.detailValue}>{profile.user.username}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Phone:</Text>
                        <Text style={styles.detailValue}>{profile.user.phone}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Email:</Text>
                        <Text style={styles.detailValue}>{profile.user.email}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Member Since:</Text>
                        <Text style={styles.detailValue}>
                            {new Date(profile.user.created_at).toDateString()}
                        </Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Last Login:</Text>
                        <Text style={styles.detailValue}>
                            {new Date(profile.user.last_login).toDateString()}
                        </Text>
                    </View>
                </View>

                {/* Progress Overview */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>📊 Progress Overview</Text>

                    {/* Daily Progress */}
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>📅 Daily Progress</Text>
                            <Text style={styles.progressPercentage}>
                                {Math.round(dailyProgress * 100)}%
                            </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${dailyProgress * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {completedTasks} out of {totalTasks} tasks completed today
                        </Text>
                    </View>

                    {/* Weekly Progress */}
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>📈 Weekly Progress</Text>
                            <Text style={styles.progressPercentage}>
                                {Math.round(weeklyProgress * 100)}%
                            </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    styles.progressBarWeekly,
                                    { width: `${weeklyProgress * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {weeklyCompletedDays} out of {weeklyTotalDays} days completed this week
                        </Text>
                    </View>

                    {/* Heart Points */}
                    <View style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressTitle}>❤️ Heart Points</Text>
                            <Text style={styles.progressPercentage}>
                                {profile.daily?.heartPts || 0}/{profile.daily?.heartPtsGoal || 30}
                            </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    styles.progressBarHeart,
                                    { width: `${((profile.daily?.heartPts || 0) / (profile.daily?.heartPtsGoal || 30)) * 100}%` }
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Activity Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🏃 Today's Activity</Text>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Steps:</Text>
                        <Text style={styles.detailValue}>{profile.daily?.steps || 0}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Calories:</Text>
                        <Text style={styles.detailValue}>{profile.daily?.calories || 0} kcal</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Distance:</Text>
                        <Text style={styles.detailValue}>{profile.daily?.distance || 0} km</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Move Minutes:</Text>
                        <Text style={styles.detailValue}>{profile.daily?.moveMinutes || 0} min</Text>
                    </View>
                </View>

                {/* Rewards */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🎁 Rewards</Text>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Reward Points:</Text>
                        <Text style={styles.detailValue}>{profile.rewardPoints}</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    // Main Profile View
    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.backButton} />
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                {/* Avatar with Progress Ring */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.initials}>{profile.user.initials}</Text>
                    </View>
                    <View style={styles.progressBadge}>
                        <Text style={styles.progressBadgeText}>
                            {Math.round(dailyProgress * 100)}%
                        </Text>
                    </View>
                </View>

                {/* User Details */}
                <Text style={styles.userName}>{profile.user.username}</Text>
                <Text style={styles.userPhone}>{profile.user.phone}</Text>

                {/* Quick Progress Summary */}
                <View style={styles.quickProgress}>
                    {/* Daily Progress */}
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>
                            Daily: {completedTasks}/{totalTasks} tasks completed
                        </Text>
                        <View style={styles.miniProgressBar}>
                            <View
                                style={[
                                    styles.miniProgressFill,
                                    { width: `${dailyProgress * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.miniProgressPercentage}>
                            {Math.round(dailyProgress * 100)}%
                        </Text>
                    </View>

                    {/* Weekly Progress */}
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>
                            Weekly: {weeklyCompletedDays}/{weeklyTotalDays} days completed
                        </Text>
                        <View style={styles.miniProgressBar}>
                            <View
                                style={[
                                    styles.miniProgressFill,
                                    styles.miniProgressFillWeekly,
                                    { width: `${weeklyProgress * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.miniProgressPercentage}>
                            {Math.round(weeklyProgress * 100)}%
                        </Text>
                    </View>

                    {/* Heart Points */}
                    <View style={styles.progressItem}>
                        <Text style={styles.progressLabel}>
                            Heart Points: {profile.daily?.heartPts || 0}/{profile.daily?.heartPtsGoal || 30}
                        </Text>
                        <View style={styles.miniProgressBar}>
                            <View
                                style={[
                                    styles.miniProgressFill,
                                    styles.miniProgressFillHeart,
                                    { width: `${((profile.daily?.heartPts || 0) / (profile.daily?.heartPtsGoal || 30)) * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.miniProgressPercentage}>
                            {Math.round(((profile.daily?.heartPts || 0) / (profile.daily?.heartPtsGoal || 30)) * 100)}%
                        </Text>
                    </View>
                </View>

                {/* View Profile Button */}
                <TouchableOpacity
                    style={styles.viewProfileButton}
                    onPress={() => setShowDetailedProfile(true)}
                >
                    <Text style={styles.viewProfileButtonText}>View your profile →</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5"
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666"
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 20
    },
    errorText: {
        fontSize: 16,
        color: "#d32f2f",
        marginBottom: 20,
        textAlign: "center"
    },
    retryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0"
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center"
    },
    backButtonText: {
        fontSize: 24,
        color: theme.colors.primary
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333"
    },
    profileCard: {
        backgroundColor: "#fff",
        margin: 15,
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 15
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center"
    },
    initials: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#fff"
    },
    progressBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 2,
        borderColor: "#fff"
    },
    progressBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold"
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 10
    },
    userPhone: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
        marginBottom: 20
    },
    quickProgress: {
        width: "100%",
        marginTop: 10
    },
    progressItem: {
        marginBottom: 15
    },
    progressLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5
    },
    miniProgressBar: {
        height: 8,
        backgroundColor: "#e0e0e0",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 5
    },
    miniProgressFill: {
        height: "100%",
        backgroundColor: theme.colors.primary,
        borderRadius: 4
    },
    miniProgressFillWeekly: {
        backgroundColor: "#4caf50"
    },
    miniProgressFillHeart: {
        backgroundColor: "#f44336"
    },
    miniProgressPercentage: {
        fontSize: 12,
        color: "#666",
        textAlign: "right"
    },
    viewProfileButton: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8
    },
    viewProfileButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    },
    card: {
        backgroundColor: "#fff",
        margin: 15,
        marginTop: 0,
        borderRadius: 15,
        padding: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    sectionHeader: {
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15
    },
    detailItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    detailLabel: {
        fontSize: 14,
        color: "#666",
        flex: 1
    },
    detailValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        flex: 1,
        textAlign: "right"
    },
    progressCard: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: "#f9f9f9",
        borderRadius: 10
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333"
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.primary
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 8
    },
    progressBar: {
        height: "100%",
        backgroundColor: theme.colors.primary,
        borderRadius: 5
    },
    progressBarWeekly: {
        backgroundColor: "#4caf50"
    },
    progressBarHeart: {
        backgroundColor: "#f44336"
    },
    progressText: {
        fontSize: 12,
        color: "#666"
    },
    logoutButton: {
        backgroundColor: "#d32f2f",
        margin: 15,
        marginTop: 0,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center"
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600"
    }
});