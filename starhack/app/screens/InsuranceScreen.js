import React from "react";
import { ScrollView, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import useProfile from "../screens/useProfile";

export default function InsuranceScreen() {
    const { profile, loading, error } = useProfile();

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text>Error: {error}</Text>;

    const insurance = profile?.insurance || [];

    return (
        <ScrollView style={{ padding: 15 }}>
            {insurance.length > 0 ? (
                insurance.map((ins, i) => (
                    <Text key={i} style={{ marginBottom: 10 }}>
                        🏦 {ins.provider} ({ins.policyNumber}) —{" "}
                        {ins.active ? "Active ✅" : "Expired ❌"}
                    </Text>
                ))
            ) : (
                <Text>No insurance policies added.</Text>
            )}
        </ScrollView>
    );
}
