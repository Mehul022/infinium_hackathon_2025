import React from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import useProfile from "../screens/useProfile";

export default function MonthlyProgressScreen() {
    const { profile, loading, error } = useProfile();

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text>Error: {error}</Text>;

    const days = profile?.monthly?.days || [];

    return (
        <ScrollView style={{ padding: 15 }}>
            {days.length > 0 ? (
                days.map((d, i) => (
                    <Text key={i} style={{ marginBottom: 10 }}>
                        📅 Day {d.day}: {d.completedTasks}/5 tasks ({d.percentage}%)
                    </Text>
                ))
            ) : (
                <Text>No monthly progress available.</Text>
            )}
        </ScrollView>
    );
}
