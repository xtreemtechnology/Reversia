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
/* eslint-disable react-native/no-inline-styles */
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useTheme } from "../../../theme/ThemeProvider";

const TRACK_COLORS = {
  water: "#2563EB",
  meals: "#16A34A",
  exercise: "#EA580C",
  sleep: "#7C3AED",
};

export default function TrackScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 640;
  const boxWidth = isNarrow ? "100%" : "48%";
  const styles = getStyles(colors);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const progress = [
    {
      label: "Water",
      value: "4/8",
      color: TRACK_COLORS.water,
      icon: "water-outline",
    },
    {
      label: "Meals",
      value: "2/3",
      color: TRACK_COLORS.meals,
      icon: "restaurant-outline",
    },
    {
      label: "Exercise",
      value: "25m",
      color: TRACK_COLORS.exercise,
      icon: "walk-outline",
    },
    {
      label: "Sleep",
      value: "7h",
      color: TRACK_COLORS.sleep,
      icon: "moon-outline",
    },
  ];

  const logs = [
    {
      time: "7:30 AM",
      title: "Breakfast Logged",
      desc: "Oats, boiled egg, avocado",
      icon: "food-apple-outline",
      color: TRACK_COLORS.meals,
    },
    {
      time: "10:15 AM",
      title: "Water Intake",
      desc: "2 glasses completed",
      icon: "water-outline",
      color: TRACK_COLORS.water,
    },
    {
      time: "1:00 PM",
      title: "Exercise Done",
      desc: "20 mins brisk walk",
      icon: "walk-outline",
      color: TRACK_COLORS.exercise,
    },
    {
      time: "9:30 PM",
      title: "Sleep Goal",
      desc: "Target bedtime reminder",
      icon: "moon-outline",
      color: TRACK_COLORS.sleep,
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
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <View>
              <Text style={styles.smallText}>Daily Tracking</Text>
              <Text style={styles.title}>Stay Consistent</Text>
            </View>

            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="calendar-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressSub}>
              Keep building healthy habits daily.
            </Text>

            <View style={styles.grid}>
              {progress.map((item, index) => (
                <View
                  key={index}
                  style={[styles.metricBox, { width: boxWidth }]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <Text style={styles.metricValue}>{item.value}</Text>
                  <Text style={styles.metricLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Log</Text>

          <View style={styles.quickGrid}>
            <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
              <MaterialCommunityIcons
                name="food-apple-outline"
                size={24}
                color={TRACK_COLORS.meals}
              />
              <Text style={styles.quickText}>Add Meal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
              <Ionicons
                name="water-outline"
                size={24}
                color={TRACK_COLORS.water}
              />
              <Text style={styles.quickText}>Drink Water</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
              <Ionicons
                name="walk-outline"
                size={24}
                color={TRACK_COLORS.exercise}
              />
              <Text style={styles.quickText}>Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.quickCard, { width: boxWidth }]}>
              <Ionicons
                name="moon-outline"
                size={24}
                color={TRACK_COLORS.sleep}
              />
              <Text style={styles.quickText}>Sleep</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Today's Activity</Text>

          {logs.map((item, index) => (
            <View key={index} style={styles.logCard}>
              <View
                style={[styles.logIcon, { backgroundColor: `${item.color}15` }]}
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

          <View style={styles.tipCard}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color={TRACK_COLORS.sleep}
            />
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

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.muted,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      marginTop: 3,
    },
    headerBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },
    progressSub: {
      marginTop: 5,
      color: colors.muted,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: 18,
      rowGap: 14,
    },
    metricBox: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },
    metricLabel: {
      marginTop: 3,
      color: colors.muted,
    },
    sectionTitle: {
      marginTop: 26,
      marginBottom: 12,
      paddingHorizontal: 20,
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },
    quickGrid: {
      paddingHorizontal: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: 14,
    },
    quickCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickText: {
      marginTop: 10,
      fontWeight: "700",
      color: colors.text,
    },
    logCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },
    logDesc: {
      marginTop: 4,
      color: colors.muted,
      fontSize: 13,
    },
    logTime: {
      fontSize: 12,
      color: colors.muted,
      marginLeft: 8,
    },
    tipCard: {
      marginTop: 18,
      marginHorizontal: 20,
      backgroundColor: colors.background === "#FFFFFF" ? "#F3E8FF" : "#312E81",
      borderRadius: 22,
      padding: 16,
      flexDirection: "row",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipTitle: {
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    tipText: {
      color: colors.muted,
      lineHeight: 20,
    },
  });
