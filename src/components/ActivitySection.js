// src/components/ActivitySection.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import ActivityCard from "./ActivityCard";

export default function ActivitySection() {
  const activities = [
    {
      type: "walking",
      title: "Walking",
      duration: "25 min",
      calories: 120,
      icon: "walk-outline",
    },
    {
      type: "workout",
      title: "Strength Training",
      duration: "40 min",
      calories: 280,
      icon: "barbell-outline",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Physical Activity</Text>
        <Text style={styles.subtitle}>Exercise helps regulate blood sugar</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {activities.map((activity, index) => (
          <ActivityCard key={index} {...activity} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  scrollView: {
    paddingLeft: 20,
  },
});
