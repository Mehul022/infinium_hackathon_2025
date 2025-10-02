import React, { useState, useEffect } from "react";
import { ScrollView, ActivityIndicator, StyleSheet, View, Alert } from "react-native";
import { Text, ProgressBar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DailyTasksScreen() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDailyTasks();
    }, []);

    const fetchDailyTasks = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get the token from AsyncStorage
            const token = await AsyncStorage.getItem("token");

            if (!token) {
                Alert.alert("Error", "Please login first");
                return;
            }

            // Fetch daily progress/tasks from backend
            const response = await fetch("http://10.231.48.49:3000/api/daily-progress", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.status !== 200) {
                setError(data.error || "Failed to fetch tasks");
                return;
            }

            // Set the tasks from the response
            setTasks(data.tasks || []);
        } catch (err) {
            console.error("Error fetching daily tasks:", err);
            setError("An error occurred while fetching tasks");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Daily Tasks</Text>

            {tasks.length > 0 ? (
                tasks.map((task, index) => (
                    <View key={index} style={styles.taskCard}>
                        {/* Task Name */}
                        <View style={styles.taskHeader}>
                            <Text style={styles.taskName}>
                                {task.name}
                                {task.isHeartTask && " ❤️"}
                            </Text>
                            <Text style={styles.percentageText}>
                                {Math.round(task.percentage)}%
                            </Text>
                        </View>

                        {/* Task Description */}
                        {task.description && (
                            <Text style={styles.taskDescription}>{task.description}</Text>
                        )}

                        {/* Progress Bar */}
                        <ProgressBar
                            progress={task.percentage / 100}
                            color={task.completed ? "#4CAF50" : "#6200ee"}
                            style={styles.progressBar}
                        />

                        {/* Status */}
                        <Text style={styles.statusText}>
                            {task.completed ? "✅ Completed" : "🔄 In Progress"}
                        </Text>
                    </View>
                ))
            ) : (
                <View style={styles.noTasksContainer}>
                    <Text style={styles.noTasksText}>No daily tasks available.</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f5f5f5"
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333"
    },
    taskCard: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
    },
    taskName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1
    },
    percentageText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#6200ee"
    },
    taskDescription: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
        lineHeight: 20
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 8
    },
    statusText: {
        fontSize: 12,
        color: "#888",
        marginTop: 4
    },
    errorText: {
        fontSize: 16,
        color: "#d32f2f",
        textAlign: "center"
    },
    noTasksContainer: {
        alignItems: "center",
        marginTop: 40
    },
    noTasksText: {
        fontSize: 16,
        color: "#888"
    }
});