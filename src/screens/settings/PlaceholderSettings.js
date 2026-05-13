import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const PlaceholderScreen = ({ navigation, title }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 28 }} />
    </View>

    <View style={styles.content}>
      <View style={styles.placeholder}>
        <Ionicons name="construct" size={60} color="#D1D5DB" />
        <Text style={styles.placeholderText}>Coming Soon</Text>
        <Text style={styles.placeholderDesc}>
          This feature is being developed
        </Text>
      </View>
    </View>
  </SafeAreaView>
);

export const HealthGoals = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Health Goals" />
);
export const PrivacySettings = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Privacy Settings" />
);
export const DataSync = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Data Sync" />
);
export const ExportData = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Export Health Data" />
);
export const Appearance = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Appearance" />
);
export const About = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="About" />
);
export const Support = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Help & Support" />
);
export const DeleteAccount = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Delete Account" />
);
export const Notifications = ({ navigation }) => (
  <PlaceholderScreen navigation={navigation} title="Notifications" />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F8" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "#FBFBFD",
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
  },
  placeholderDesc: { fontSize: 14, color: "#9CA3AF", marginTop: 8 },
});
