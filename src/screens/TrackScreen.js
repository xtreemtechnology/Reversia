// src/screens/TrackScreen.js

import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AnimatedScreen from '../components/AnimatedScreen';

export default function TrackScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 640;
  const boxWidth = isNarrow ? '100%' : '48%';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const progress = [
    { label: "Water", value: "4/8", color: "#2563EB", icon: "water-outline" },
    { label: "Meals", value: "2/3", color: "#16A34A", icon: "restaurant-outline" },
    { label: "Exercise", value: "25m", color: "#EA580C", icon: "walk-outline" },
    { label: "Sleep", value: "7h", color: "#7C3AED", icon: "moon-outline" },
  ];

  const logs = [
    {
      time: "7:30 AM",
      title: "Breakfast Logged",
      desc: "Oats, boiled egg, avocado",
      icon: "food-apple-outline",
      color: "#16A34A",
    },
    {
      time: "10:15 AM",
      title: "Water Intake",
      desc: "2 glasses completed",
      icon: "water-outline",
      color: "#2563EB",
    },
    {
      time: "1:00 PM",
      title: "Exercise Done",
      desc: "20 mins brisk walk",
      icon: "walk-outline",
      color: "#EA580C",
    },
    {
      time: "9:30 PM",
      title: "Sleep Goal",
      desc: "Target bedtime reminder",
      icon: "moon-outline",
      color: "#7C3AED",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View>
            <Text style={styles.smallText}>Daily Tracking</Text>
            <Text style={styles.title}>Stay Consistent</Text>
          </View>

          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="calendar-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressSub}>
            Keep building healthy habits daily.
          </Text>

          <View style={styles.grid}>
            {progress.map((item, index) => (
              <View key={index} style={[styles.metricBox, { width: boxWidth }]}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.color}
                  />
                </View>

                <Text style={styles.metricValue}>{item.value}</Text>
                <Text style={styles.metricLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Logs */}
        <Text style={styles.sectionTitle}>Quick Log</Text>

          <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
            <MaterialCommunityIcons
              name="food-apple-outline"
              size={24}
              color="#16A34A"
            />
            <Text style={styles.quickText}>Add Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
            <Ionicons name="water-outline" size={24} color="#2563EB" />
            <Text style={styles.quickText}>Drink Water</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
            <Ionicons name="walk-outline" size={24} color="#EA580C" />
            <Text style={styles.quickText}>Exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
            <Ionicons name="moon-outline" size={24} color="#7C3AED" />
            <Text style={styles.quickText}>Sleep</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Today's Activity</Text>

        {logs.map((item, index) => (
          <View key={index} style={styles.logCard}>
            <View
              style={[
                styles.logIcon,
                { backgroundColor: `${item.color}15` },
              ]}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.logTitle}>{item.title}</Text>
              <Text style={styles.logDesc}>{item.desc}</Text>
            </View>

            <Text style={styles.logTime}>{item.time}</Text>
          </View>
        ))}

        {/* Smart Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={22} color="#7C3AED" />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Smart Tip</Text>
            <Text style={styles.tipText}>
              Light walking after meals may support healthy glucose balance.
            </Text>
          </View>
        </View>
      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallText: {
    fontSize: 13,
    color: "#6B7280",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginTop: 3,
  },

  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  progressCard: {
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 18,
  },

  progressTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  progressSub: {
    marginTop: 5,
    color: "#6B7280",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 18,
    rowGap: 14,
  },

  metricBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 16,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  metricValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },

  metricLabel: {
    marginTop: 3,
    color: "#6B7280",
  },

  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  quickGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  quickCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
  },

  quickText: {
    marginTop: 10,
    fontWeight: "700",
    color: "#111827",
  },

  logCard: {
    marginHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  logIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  logTitle: {
    fontWeight: "800",
    color: "#111827",
  },

  logDesc: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },

  logTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  tipCard: {
    marginTop: 18,
    marginHorizontal: 20,
    backgroundColor: "#F3E8FF",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },

  tipTitle: {
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },

  tipText: {
    color: "#6B7280",
    lineHeight: 20,
  },
});