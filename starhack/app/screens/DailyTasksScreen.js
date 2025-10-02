import React from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import useProfile from "../screens/useProfile";

export default function DailyTasksScreen() {
    const { profile, loading, error } = useProfile();

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text>Error: {error}</Text>;

    const daily = profile?.daily || {};
    const taskKeys = Object.keys(daily);

    return (
        <ScrollView style={{ padding: 15 }}>
            {taskKeys.length > 0 ? (
                taskKeys.map((task, i) => (
                    <Text key={i} style={{ marginBottom: 10 }}>
                        {task.toUpperCase()}: {daily[task] ? "✅ Done" : "❌ Pending"}
                    </Text>
                ))
            ) : (
                <Text>No daily tasks available.</Text>
            )}
        </ScrollView>
    );
}
