import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FitnessInfoPopup from '../components/FitnessInfoPopup';

const { width, height } = Dimensions.get('window');

const FirstPage = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Steps');
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
          return;
        }

        const response = await fetch('http://10.231.48.49:3000/api/user/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Invalid JSON from server:', text);
          Alert.alert('Error', 'Server returned invalid response');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          Alert.alert('Error', data.error || 'Failed to fetch progress data');
          setLoading(false);
          return;
        }

        setUserData(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { username, dailyProgress, weeklyProgress, rewardPoints } = userData;

  const totalSteps = dailyProgress.steps || 0;
  const calories = dailyProgress.calories || Math.round(totalSteps * 0.04);
  const distance = dailyProgress.distance || +(totalSteps * 0.0008).toFixed(2);
  const stepsGoal = dailyProgress.tasks.find(t => t.name === 'task1')?.goal || 10000;

  const CircularProgress = ({ value, maxValue, size = 200 }) => {
    const progress = Math.min((value / maxValue) * 100, 100);
    const circumference = 2 * Math.PI * ((size - 20) / 2);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={[styles.circularContainer, { width: size, height: size }]}>
        <View style={[styles.circleBackground, {
          width: size - 20,
          height: size - 20,
          borderRadius: (size - 20) / 2,
          borderWidth: 8,
          borderColor: '#EEE'
        }]} />
        <View style={[styles.circleProgress, {
          width: size - 20,
          height: size - 20,
          borderRadius: (size - 20) / 2,
          borderWidth: 8,
          borderColor: '#00BFA5',
          borderLeftColor: progress > 25 ? '#00BFA5' : 'transparent',
          borderTopColor: progress > 0 ? '#00BFA5' : 'transparent',
          borderRightColor: progress > 50 ? '#00BFA5' : 'transparent',
          borderBottomColor: progress > 75 ? '#00BFA5' : 'transparent',
          transform: [{ rotate: '-90deg' }]
        }]} />
        <View style={styles.circularContent}>
          <Text style={styles.mainValue}>
            {selectedTab === 'Steps' ? totalSteps.toLocaleString() : dailyProgress.heartPts}
          </Text>
          {selectedTab === 'Steps' ? (
            <View style={styles.rewardSection}>
              <Text style={styles.goalText}>of {stepsGoal.toLocaleString()}</Text>
              <Text style={styles.rewardText}>🏆 {rewardPoints} points earned</Text>
              <Text style={styles.goalText}>{calories} cal • {distance} km</Text>
            </View>
          ) : (
            <View style={styles.rewardSection}>
              <Text style={styles.goalText}>of {dailyProgress.heartPtsGoal} goal</Text>
              <Text style={styles.heartPtsInfo}>Last 30 days activity</Text>
              <Text style={styles.intensityText}>💪 Complete tasks daily</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F5F5F5" barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 150 }}>

        {/* Info & Avatar */}
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowInfoPopup(true)}>
            <Ionicons name="information-circle-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('ProfileScreen')}>
            <Text style={styles.profileText}>{username.split(' ')[0][0]}</Text>
          </TouchableOpacity>
        </View>

        {/* Circular Progress */}
        <View style={styles.mainSection}>
          <CircularProgress
            value={selectedTab === 'Steps' ? totalSteps : dailyProgress.heartPts}
            maxValue={selectedTab === 'Steps' ? stepsGoal : dailyProgress.heartPtsGoal}
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

        {/* Last 7 days progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Last 7 Days Progress</Text>
          </View>
          <View style={styles.weeklyIndicators}>
            {weeklyProgress.map((day, idx) => {
              const completed = day.completedTasks || 0;
              const opacity = Math.min(completed / 5, 1); // Max 5 tasks, full opacity
              const bgColor = completed > 0
                ? `rgba(0, 191, 165, ${0.2 + (opacity * 0.8)})`
                : '#EEE';

              return (
                <View key={idx} style={styles.dayContainer}>
                  <View style={[styles.dayIndicator, { backgroundColor: bgColor }]}>
                    <Text style={styles.taskCount}>{completed}</Text>
                  </View>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.progressHint}>Tasks completed per day</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#2196F3" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('DailyTasksScreen')}>
          <Ionicons name="clipboard-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('InsuranceScreen')}>
          <Ionicons name="list" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <Ionicons name="person-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <FitnessInfoPopup visible={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
    </View>
  );
};

export default FirstPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { paddingHorizontal: 20 },
  topIcons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  iconButton: { padding: 8, borderRadius: 8, backgroundColor: '#EEE' },
  profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center' },
  profileText: { color: '#FFF', fontWeight: 'bold' },
  mainSection: { alignItems: 'center', marginVertical: 20 },
  circularContainer: { justifyContent: 'center', alignItems: 'center' },
  circleBackground: { position: 'absolute' },
  circleProgress: { position: 'absolute' },
  circularContent: { justifyContent: 'center', alignItems: 'center' },
  mainValue: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  rewardSection: { marginTop: 8, alignItems: 'center' },
  goalText: { fontSize: 14, color: '#666', marginTop: 4 },
  rewardText: { fontSize: 13, color: '#FFB300', marginTop: 4, fontWeight: '600' },
  heartPtsInfo: { fontSize: 12, color: '#666', marginTop: 4 },
  intensityText: { fontSize: 12, color: '#FF5252', marginTop: 4 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 15 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginHorizontal: 5 },
  activeToggle: { backgroundColor: '#E0F7F4' },
  toggleText: { marginLeft: 6, fontSize: 14, color: '#666' },
  activeToggleText: { color: '#00BFA5', fontWeight: 'bold' },
  section: { marginTop: 20 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  weeklyIndicators: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayContainer: { alignItems: 'center', flex: 1 },
  dayIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEE',
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00BFA5'
  },
  taskCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  dayLabel: { fontSize: 11, color: '#666', fontWeight: '500' },
  progressHint: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF'
  },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  activeNavLabel: { color: '#2196F3', fontWeight: 'bold' },
});