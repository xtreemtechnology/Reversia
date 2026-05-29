import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import ErrorBoundary from "../../../components/ErrorBoundary";
import EmptyMainInsightCard from "./EmptyMainInsightCard";
import EmptyRestRecoveryCard from "./EmptyRestRecoveryCard";
import EmptyRecentPatterns from "./EmptyRecentPatterns";
import EmptyWeeklyWellness from "./EmptyWeeklyWellness";

export default function EmptyStateHomeScreen({ navigation, userData }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const firstName = userData?.firstName || userData?.displayName?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning," : hour < 17 ? "Good afternoon," : "Good evening,";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}> 
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userData?.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={[styles.avatar, { borderColor: colors.border }]} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="person" size={18} color={colors.mutedForeground} />
              </View>
            )}
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{firstName}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: colors.card }]} activeOpacity={0.7}>
            <Ionicons name="notifications" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ErrorBoundary>
          <EmptyMainInsightCard navigation={navigation} />
        </ErrorBoundary>
        <ErrorBoundary>
          <EmptyRestRecoveryCard />
        </ErrorBoundary>
        <ErrorBoundary>
          <EmptyRecentPatterns />
        </ErrorBoundary>
        <ErrorBoundary>
          <EmptyWeeklyWellness />
        </ErrorBoundary>

        <View style={[styles.exploreRow, { borderTopColor: colors.border + "60" }]}> 
          <Text style={[styles.exploreLabel, { color: colors.mutedForeground }]}>Or explore</Text>
          <View style={styles.exploreLinks}>
            <TouchableOpacity
              onPress={() => navigation?.navigate("Learn")}
              style={[styles.exploreChip, { backgroundColor: colors.card, borderColor: colors.border + "80" }]}
              activeOpacity={0.75}
            >
              <Ionicons name="book" size={15} color={colors.secondary} />
              <Text style={[styles.exploreChipText, { color: colors.text }]}>Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation?.navigate("Track")}
              style={[styles.exploreChip, { backgroundColor: colors.card, borderColor: colors.border + "80" }]}
              activeOpacity={0.75}
            >
              <Ionicons name="add-circle" size={15} color={colors.primary} />
              <Text style={[styles.exploreChipText, { color: colors.text }]}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  userName: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "DMSans_500Medium",
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreRow: {
    borderTopWidth: 1,
    paddingTop: 20,
    gap: 14,
  },
  exploreLabel: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  exploreLinks: {
    flexDirection: "row",
    gap: 12,
  },
  exploreChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  exploreChipText: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
  },
});
