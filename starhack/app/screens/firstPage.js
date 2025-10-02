import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import FitnessInfoPopup from '../components/FitnessInfoPopup';

const { width, height } = Dimensions.get('window');

const FirstPage = () => {
  const [selectedTab, setSelectedTab] = useState('Steps');
  const [showInfoPopup, setShowInfoPopup] = useState(true); // Show popup by default

  // Random values for demo
  const healthData = {
    steps: 1580,
    stepsGoal: 10000,
    heartPts: 15,
    heartPtsGoal: 30,
    rewardPoints: 25,
    calories: 938,
    distance: 1.12,
    moveMinutes: 23,
    dailyGoalsAchieved: 0,
    dailyGoalsTotal: 7,
    weeklyTarget: 66,
    weeklyTotal: 150,
    activityMinutes: 23, // minutes of heart-pumping activity
  };

  const weeklyProgress = [
    { day: 'F', completed: false },
    { day: 'S', completed: false },
    { day: 'S', completed: false },
    { day: 'M', completed: true },
    { day: 'T', completed: true },
    { day: 'W', completed: true },
    { day: 'T', completed: true },
  ];

  const CircularProgress = ({ value, maxValue, size = 200 }) => {
    const progress = (value / maxValue) * 100;
    
    return (
      <View style={[styles.circularContainer, { width: size, height: size }]}>
        {/* Background circle */}
        <View style={[
          styles.circleBackground, 
          { 
            width: size - 20, 
            height: size - 20, 
            borderRadius: (size - 20) / 2,
          }
        ]} />
        
        {/* Progress circle - simplified version */}
        <View style={[
          styles.circleProgress, 
          { 
            width: size - 20, 
            height: size - 20, 
            borderRadius: (size - 20) / 2,
            transform: [{ rotate: `${(progress * 3.6) - 90}deg` }]
          }
        ]} />
        
        <View style={styles.circularContent}>
          <Text style={styles.mainValue}>
            {selectedTab === 'Steps' ? healthData.steps.toLocaleString() : healthData.heartPts}
          </Text>
          {selectedTab === 'Steps' ? (
            <View style={styles.rewardSection}>
              <Text style={styles.goalText}>of {healthData.stepsGoal.toLocaleString()}</Text>
              <Text style={styles.rewardText}>🏆 {healthData.rewardPoints} points earned</Text>
            </View>
          ) : (
            <View style={styles.rewardSection}>
              <Text style={styles.goalText}>of {healthData.heartPtsGoal} goal</Text>
              <Text style={styles.heartPtsInfo}>{healthData.activityMinutes} mins activity</Text>
              <Text style={styles.intensityText}>💪 Increase intensity for more</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={true}
        alwaysBounceVertical={true}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {/* Info and Profile Icons */}
        <View style={styles.topIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowInfoPopup(true)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileText}>a</Text>
          </TouchableOpacity>
        </View>

        {/* Main Circular Progress */}
        <View style={styles.mainSection}>
          <CircularProgress 
            value={selectedTab === 'Steps' ? healthData.steps : healthData.heartPts} 
            maxValue={selectedTab === 'Steps' ? healthData.stepsGoal : healthData.heartPtsGoal} 
            size={250}
          />
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, selectedTab === 'Heart Pts' && styles.activeToggle]}
            onPress={() => setSelectedTab('Heart Pts')}
          >
            <Ionicons name="heart" size={16} color={selectedTab === 'Heart Pts' ? "#00BFA5" : "#666"} />
            <Text style={[styles.toggleText, selectedTab === 'Heart Pts' && styles.activeToggleText]}>
              Heart Pts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleButton, selectedTab === 'Steps' && styles.activeToggle]}
            onPress={() => setSelectedTab('Steps')}
          >
            <MaterialIcons name="directions-walk" size={16} color={selectedTab === 'Steps' ? "#00BFA5" : "#666"} />
            <Text style={[styles.toggleText, selectedTab === 'Steps' && styles.activeToggleText]}>
              Steps
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity Breakdown - only show when Heart Pts selected */}
        {selectedTab === 'Heart Pts' && (
          <View style={styles.activityBreakdown}>
            <Text style={styles.activityTitle}>How you earned Heart Points:</Text>
            <View style={styles.activityItem}>
              <Text style={styles.activityType}>🚶 Brisk walk</Text>
              <Text style={styles.activityDetails}>15 mins → 8 points</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityType}>🏃 Light jog</Text>
              <Text style={styles.activityDetails}>8 mins → 7 points</Text>
            </View>
            <Text style={styles.tipText}>💡 Tip: Higher intensity = more points per minute!</Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{healthData.calories}</Text>
            <Text style={styles.statLabel}>Cal</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{healthData.distance}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{healthData.moveMinutes}</Text>
            <Text style={styles.statLabel}>Move Min</Text>
          </View>
        </View>

        {/* Daily Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your daily goals</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
          <Text style={styles.sectionSubtitle}>Last 7 days</Text>
          
          <View style={styles.dailyGoals}>
            <View style={styles.goalsLeft}>
              <Text style={styles.goalsValue}>
                4/{healthData.dailyGoalsTotal}
              </Text>
              <Text style={styles.goalsLabel}>Achieved</Text>
            </View>
            <View style={styles.weeklyIndicators}>
              {weeklyProgress.map((day, index) => (
                <View key={index} style={styles.dayContainer}>
                  <View style={[
                    styles.dayIndicator, 
                    day.completed && styles.dayCompleted
                  ]} />
                  <Text style={styles.dayLabel}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Weekly Target Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your weekly target</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
          <Text style={styles.sectionSubtitle}>29 Sept - 5 Oct</Text>
          
          <View style={styles.weeklyTarget}>
            <Text style={styles.weeklyValue}>
              <Text style={styles.weeklyAchieved}>{healthData.weeklyTarget}</Text>
              <Text style={styles.weeklyTotal}> of {healthData.weeklyTotal}</Text>
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(healthData.weeklyTarget / healthData.weeklyTotal) * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Bottom space for proper scrolling */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#2196F3" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="clipboard-outline" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="list" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Android Navigation */}
      <View style={styles.androidNav}>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="square-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Fitness Info Popup */}
      <FitnessInfoPopup 
        visible={showInfoPopup}
        onClose={() => setShowInfoPopup(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  topIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    borderWidth: 8,
    borderColor: '#E5E5E5',
    backgroundColor: 'transparent',
  },
  circleProgress: {
    position: 'absolute',
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#00BFA5',
    backgroundColor: 'transparent',
  },
  circularContent: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mainValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  rewardSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  goalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  heartPtsInfo: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 2,
  },
  intensityText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
  },
  activityBreakdown: {
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 0,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  activityType: {
    fontSize: 14,
    color: '#555',
  },
  activityDetails: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  tipText: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  heartPtsInfo: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 2,
  },
  intensityText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginVertical: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeToggle: {
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  activeToggleText: {
    color: '#00BFA5',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20, // Increased margin to ensure spacing
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  dailyGoals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Changed to flex-start to avoid text cutoff
    paddingBottom: 10, // Added bottom padding
  },
  goalsLeft: {
    flex: 1,
  },
  goalsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  goalsLabel: {
    fontSize: 16, // Increased font size
    color: '#333', // Darker color for better visibility
    marginTop: 6, // Increased margin
    fontWeight: '500', // Added weight for better visibility
  },
  weeklyIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 4,
  },
  dayIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  dayCompleted: {
    backgroundColor: '#00BFA5',
    borderColor: '#00BFA5',
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
  },
  weeklyTarget: {
    marginBottom: 16,
  },
  weeklyValue: {
    fontSize: 24,
    marginBottom: 8,
  },
  weeklyAchieved: {
    fontWeight: 'bold',
    color: '#00BFA5',
  },
  weeklyTotal: {
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00BFA5',
    borderRadius: 4,
  },
  addButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeNavLabel: {
    color: '#2196F3',
  },
  androidNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    paddingVertical: 8,
  },
});

export default FirstPage;
