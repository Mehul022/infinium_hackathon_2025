import React, { useState, useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Alert,
    RefreshControl,
    ActivityIndicator
} from "react-native";
import {
    Text,
    Card,
    Button,
    Divider,
    Chip,
    ProgressBar,
    Badge
} from "react-native-paper";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InsuranceScreen({ navigation }) {
    const [insurancePlans, setInsurancePlans] = useState([]);
    const [userRewards, setUserRewards] = useState({ credits: 0, badges: 0, badgesList: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const BASE_URL = "http://10.231.48.49:3000"; // Update this to your server IP

    useEffect(() => {
        fetchInsurancePlans();
        fetchUserRewards();
    }, []);

    const fetchUserRewards = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/insurance/rewards`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUserRewards({
                    credits: data.credits,
                    badges: data.badges.length,
                    badgesList: data.badges
                });
            }
        } catch (error) {
            console.error("Error fetching rewards:", error);
        }
    };

    const fetchInsurancePlans = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await AsyncStorage.getItem("token");

            const response = await fetch(`${BASE_URL}/api/insurance/plans`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                setInsurancePlans(data.plans);
                setUserRewards(data.userRewards);
            } else {
                setError(data.error || "Failed to fetch insurance plans");
            }
        } catch (error) {
            setError("Network error. Please check your connection.");
            console.error("Error fetching insurance plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchInsurancePlans();
        setRefreshing(false);
    };

    const addSampleRewards = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/insurance/rewards/sample`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                Alert.alert("Success", "Sample rewards added! Pull down to refresh.");
                await fetchUserRewards();
                await fetchInsurancePlans();
            }
        } catch (error) {
            Alert.alert("Error", "Failed to add sample rewards");
        }
    };

    const getCoverageIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'health': return 'health-and-safety';
            case 'life': return 'favorite';
            case 'auto': return 'directions-car';
            case 'home': return 'home';
            case 'travel': return 'flight';
            case 'business': return 'business';
            default: return 'security';
        }
    };

    const getCoverageColor = (type) => {
        switch (type.toLowerCase()) {
            case 'health': return '#4CAF50';
            case 'life': return '#2196F3';
            case 'auto': return '#FF9800';
            case 'home': return '#9C27B0';
            case 'travel': return '#00BCD4';
            case 'business': return '#607D8B';
            default: return '#757575';
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Fetching insurance plans...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Insurance Plans</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                >
                    <Ionicons name="refresh" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Rewards Summary */}
            <Card style={styles.rewardsCard} elevation={4}>
                <Card.Content>
                    <View style={styles.rewardsHeader}>
                        <MaterialIcons name="stars" size={24} color="#FFD700" />
                        <Text style={styles.rewardsTitle}>Your Rewards</Text>
                    </View>
                    <Divider style={styles.divider} />

                    <View style={styles.rewardsRow}>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardValue}>{userRewards.credits}</Text>
                            <Text style={styles.rewardLabel}>Credits</Text>
                            <Text style={styles.rewardBenefit}>₹{userRewards.credits} off</Text>
                        </View>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardValue}>{userRewards.badges}</Text>
                            <Text style={styles.rewardLabel}>Badges</Text>
                            <Text style={styles.rewardBenefit}>₹{userRewards.badges * 100} off</Text>
                        </View>
                        <View style={styles.rewardItem}>
                            <Text style={styles.rewardValue}>₹{userRewards.credits + (userRewards.badges * 100)}</Text>
                            <Text style={styles.rewardLabel}>Total Savings</Text>
                            <Text style={styles.rewardBenefit}>Per plan</Text>
                        </View>
                    </View>

                    {userRewards.badgesList && userRewards.badgesList.length > 0 && (
                        <View style={styles.badgesContainer}>
                            <Text style={styles.badgesTitle}>Your Badges:</Text>
                            <View style={styles.badgesRow}>
                                {userRewards.badgesList.map((badge, index) => (
                                    <Chip key={index} style={styles.badgeChip} textStyle={styles.badgeText}>
                                        {badge}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}

                    <Button
                        mode="outlined"
                        onPress={addSampleRewards}
                        style={styles.sampleButton}
                        labelStyle={styles.sampleButtonText}
                    >
                        Add Sample Rewards (Testing)
                    </Button>
                </Card.Content>
            </Card>

            {/* Error Handling */}
            {error && (
                <Card style={styles.errorCard} elevation={2}>
                    <Card.Content>
                        <View style={styles.errorContent}>
                            <MaterialIcons name="error" size={24} color="#F44336" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                        <Button mode="contained" onPress={fetchInsurancePlans} style={styles.retryButton}>
                            Retry
                        </Button>
                    </Card.Content>
                </Card>
            )}

            {/* Insurance Plans */}
            {insurancePlans.length > 0 ? (
                <View style={styles.plansContainer}>
                    <Text style={styles.sectionTitle}>Available Insurance Plans</Text>
                    {insurancePlans.map((plan, index) => (
                        <Card key={index} style={styles.planCard} elevation={3}>
                            <Card.Content>
                                {/* Plan Header */}
                                <View style={styles.planHeader}>
                                    <View style={styles.planTitleRow}>
                                        <MaterialIcons
                                            name={getCoverageIcon(plan.coverageType)}
                                            size={24}
                                            color={getCoverageColor(plan.coverageType)}
                                        />
                                        <View style={styles.planTitleContainer}>
                                            <Text style={styles.planName}>{plan.planName}</Text>
                                            <Text style={styles.planProvider}>{plan.provider}</Text>
                                        </View>
                                        <Badge
                                            style={[styles.coverageBadge, { backgroundColor: getCoverageColor(plan.coverageType) }]}
                                        >
                                            {plan.coverageType}
                                        </Badge>
                                    </View>
                                </View>

                                <Divider style={styles.divider} />

                                {/* Pricing */}
                                <View style={styles.pricingContainer}>
                                    {plan.discount > 0 ? (
                                        <View style={styles.discountPricing}>
                                            <Text style={styles.originalPrice}>₹{plan.originalPrice.toLocaleString()}</Text>
                                            <View style={styles.finalPriceRow}>
                                                <Text style={styles.finalPrice}>₹{plan.finalPrice.toLocaleString()}</Text>
                                                <Chip style={styles.discountChip}>
                                                    Save ₹{plan.discount}
                                                </Chip>
                                            </View>
                                        </View>
                                    ) : (
                                        <Text style={styles.regularPrice}>₹{plan.premiumAmount.toLocaleString()}</Text>
                                    )}
                                    <Text style={styles.coverage}>Coverage: ₹{plan.coverageAmount.toLocaleString()}</Text>
                                </View>

                                {/* Discount Breakdown */}
                                {plan.discount > 0 && (
                                    <View style={styles.discountBreakdown}>
                                        <Text style={styles.discountTitle}>Your Savings Breakdown:</Text>
                                        {plan.discountBreakdown.badgeDiscount > 0 && (
                                            <Text style={styles.discountItem}>
                                                🏆 Badge Discount: ₹{plan.discountBreakdown.badgeDiscount}
                                                ({plan.discountBreakdown.totalBadges} badges × ₹100)
                                            </Text>
                                        )}
                                        {plan.discountBreakdown.creditDiscount > 0 && (
                                            <Text style={styles.discountItem}>
                                                💰 Credit Discount: ₹{plan.discountBreakdown.creditDiscount}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {/* Features */}
                                <View style={styles.featuresContainer}>
                                    <Text style={styles.featuresTitle}>Key Features:</Text>
                                    {plan.features.map((feature, idx) => (
                                        <View key={idx} style={styles.featureItem}>
                                            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                                            <Text style={styles.featureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Age Group */}
                                <View style={styles.ageGroupContainer}>
                                    <MaterialIcons name="group" size={16} color="#757575" />
                                    <Text style={styles.ageGroupText}>Suitable for: {plan.ageGroup}</Text>
                                </View>

                                {/* Action Button */}
                                <Button
                                    mode="contained"
                                    style={[styles.selectButton, { backgroundColor: getCoverageColor(plan.coverageType) }]}
                                    onPress={() => Alert.alert("Plan Selected", `You selected ${plan.planName}`)}
                                >
                                    Select This Plan
                                </Button>
                            </Card.Content>
                        </Card>
                    ))}
                </View>
            ) : !loading && !error && (
                <Card style={styles.emptyCard} elevation={2}>
                    <Card.Content style={styles.emptyContent}>
                        <MaterialIcons name="info" size={48} color="#757575" />
                        <Text style={styles.emptyText}>No insurance plans available</Text>
                        <Button mode="outlined" onPress={fetchInsurancePlans}>
                            Refresh
                        </Button>
                    </Card.Content>
                </Card>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingTop: 50,
        backgroundColor: "#f5f5f5",
    },
    backButton: {
        padding: 8,
    },
    refreshButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    rewardsCard: {
        margin: 16,
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: "white",
    },
    rewardsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    rewardsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginLeft: 8,
    },
    divider: {
        marginVertical: 12,
        backgroundColor: "#e0e0e0",
    },
    rewardsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    rewardItem: {
        alignItems: "center",
        flex: 1,
    },
    rewardValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2196F3",
    },
    rewardLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    rewardBenefit: {
        fontSize: 10,
        color: "#4CAF50",
        fontWeight: "500",
        marginTop: 2,
    },
    badgesContainer: {
        marginTop: 8,
    },
    badgesTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginBottom: 8,
    },
    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    badgeChip: {
        backgroundColor: "#E3F2FD",
        marginBottom: 4,
    },
    badgeText: {
        fontSize: 10,
        color: "#1976D2",
    },
    sampleButton: {
        marginTop: 12,
        borderColor: "#FF9800",
    },
    sampleButtonText: {
        color: "#FF9800",
        fontSize: 12,
    },
    errorCard: {
        margin: 16,
        borderRadius: 12,
        backgroundColor: "#FFEBEE",
    },
    errorContent: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    errorText: {
        marginLeft: 8,
        flex: 1,
        color: "#D32F2F",
        fontSize: 14,
    },
    retryButton: {
        backgroundColor: "#F44336",
    },
    plansContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
        marginTop: 8,
    },
    planCard: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: "white",
    },
    planHeader: {
        marginBottom: 12,
    },
    planTitleRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    planTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    planName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    planProvider: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    coverageBadge: {
        color: "white",
    },
    pricingContainer: {
        marginBottom: 12,
    },
    discountPricing: {
        alignItems: "flex-start",
    },
    originalPrice: {
        fontSize: 14,
        color: "#999",
        textDecorationLine: "line-through",
    },
    finalPriceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    finalPrice: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2196F3",
        marginRight: 12,
    },
    regularPrice: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    discountChip: {
        backgroundColor: "#4CAF50",
    },
    coverage: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    discountBreakdown: {
        backgroundColor: "#F8F9FA",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    discountTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginBottom: 6,
    },
    discountItem: {
        fontSize: 12,
        color: "#4CAF50",
        marginBottom: 2,
    },
    featuresContainer: {
        marginBottom: 12,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginBottom: 8,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    featureText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 6,
        flex: 1,
    },
    ageGroupContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    ageGroupText: {
        fontSize: 12,
        color: "#757575",
        marginLeft: 4,
    },
    selectButton: {
        borderRadius: 8,
    },
    emptyCard: {
        margin: 16,
        borderRadius: 12,
        backgroundColor: "white",
    },
    emptyContent: {
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#757575",
        marginVertical: 16,
        textAlign: "center",
    },
});