import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, Card, Button, Divider, ProgressBar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
        setupDailyReset();
    }, []);

    const fetchProfile = async () => {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch("http://10.231.48.49:3000/api/user/fullProfile", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setProfile(data);
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

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        navigation.replace("LoginScreen");
    };

    if (!profile) return <Text style={styles.loading}>Loading profile...</Text>;

    const totalTasks = Object.keys(profile.daily || {}).length;
    const completedTasks = Object.values(profile.daily || {}).filter(Boolean).length;
    const dailyProgress = totalTasks ? completedTasks / totalTasks : 0;

    const totalDays = profile.monthly?.days?.length || 0;
    const completedDays = profile.monthly?.days?.filter(d => d.completedTasks === 5).length || 0;
    const monthlyProgress = totalDays ? completedDays / totalDays : 0;

    const totalInsurance = profile.insurance?.length || 0;
    const activeInsurance = profile.insurance?.filter(ins => ins.active).length || 0;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Top Spacer */}
            <View style={{ height: 20 }} />

            {/* Back to Home */}
            <Button
                mode="outlined"
                icon="arrow-left"
                onPress={() => navigation.navigate("HomeScreen")}
                style={styles.backButton}
            >
                Back to Home
            </Button>

            {/* User Details */}
            <Card style={styles.card} elevation={6}>
                <Card.Title title="👤 User Details" />
                <Divider />
                <Card.Content>
                    <Text style={styles.infoText}>Username: {profile.user.username}</Text>
                    <Text style={styles.infoText}>Email: {profile.user.email}</Text>
                    <Text style={styles.infoText}>
                        Created: {new Date(profile.user.created_at).toDateString()}
                    </Text>
                    <Text style={styles.infoText}>
                        Last Login: {new Date(profile.user.last_login).toDateString()}
                    </Text>
                </Card.Content>
            </Card>

            {/* Daily Progress Summary */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("DailyTasksScreen", { daily: profile.daily })}
            >
                <Card style={styles.card} elevation={4}>
                    <Card.Title title="📅 Daily Progress" />
                    <Divider />
                    <Card.Content>
                        <Text>{completedTasks}/{totalTasks} tasks completed today</Text>
                        <ProgressBar progress={dailyProgress} color="#4caf50" style={styles.progress} />
                    </Card.Content>
                </Card>
            </TouchableOpacity>

            {/* Monthly Progress Summary */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("MonthlyProgressScreen", { monthly: profile.monthly })}
            >
                <Card style={styles.card} elevation={4}>
                    <Card.Title title="🗓️ Monthly Progress" />
                    <Divider />
                    <Card.Content>
                        {totalDays > 0 ? (
                            <>
                                <Text>{completedDays}/{totalDays} days fully completed</Text>
                                <ProgressBar progress={monthlyProgress} color="#2196f3" style={styles.progress} />
                            </>
                        ) : (
                            <Text style={styles.emptyText}>No monthly progress available.</Text>
                        )}
                    </Card.Content>
                </Card>
            </TouchableOpacity>

            {/* Insurance Summary */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate("InsuranceScreen", { insurance: profile.insurance })}
            >
                <Card style={styles.card} elevation={4}>
                    <Card.Title title="💼 Insurance" />
                    <Divider />
                    <Card.Content>
                        {totalInsurance > 0 ? (
                            <Text>Active: {activeInsurance} / Total: {totalInsurance}</Text>
                        ) : (
                            <Text style={styles.emptyText}>No insurance policies added.</Text>
                        )}
                    </Card.Content>
                </Card>
            </TouchableOpacity>

            {/* Logout */}
            <Button
                mode="contained"
                onPress={handleLogout}
                style={[styles.button, { backgroundColor: "#d32f2f", marginBottom: 30 }]}
            >
                Logout
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12, backgroundColor: "#f0f4f7" },
    loading: { textAlign: "center", marginTop: 20, fontSize: 16 },
    card: {
        marginBottom: 15,
        borderRadius: 12,
        overflow: "hidden",
    },
    progress: { height: 10, borderRadius: 5, marginTop: 6 },
    button: { marginTop: 15, borderRadius: 8 },
    backButton: { marginBottom: 15, borderRadius: 8 },
    infoText: { marginBottom: 5, fontSize: 15 },
    emptyText: { fontStyle: "italic", color: "#888", marginTop: 5 },
});
