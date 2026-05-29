/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import LucideIcon from "react-native-vector-icons/Feather"; // Replace with your standard icon library if preferred

import AnimatedScreen from "../../../components/AnimatedScreen";
import ErrorBoundary from "../../../components/ErrorBoundary";
import NotificationsModal from "../../../components/NotificationsModal";
import EmptyStateHomeScreen from "../components/EmptyStateHomeScreen";
import Header from "../components/Header";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { useUserProfile } from "../../../hooks/useUserProfile";
import secureStorage from "../../../utils/secureStorage";
import { useTheme } from "../../../theme/ThemeProvider";

export default function HomeScreen({ navigation }) {
  const { userData } = useUserProfile();
  const { logs, refetch, loading } = useUserLogs(60);
  const { colors, typography } = useTheme();
  const THEME_COLORS = colors;
  const styles = createStyles(THEME_COLORS, typography);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasLocalLogs, setHasLocalLogs] = useState(null);
  const hasLogs = Array.isArray(logs) && logs.length > 0;

  useEffect(() => {
    let mounted = true;

    const readLocalLogs = async () => {
      try {
        const [guestLogs, cachedLogs] = await Promise.all([
          secureStorage.getItem("@reversia_guest_logs"),
          secureStorage.getItem("@reversia_cached_logs"),
        ]);
        if (!mounted) return;
        setHasLocalLogs(Boolean(guestLogs || cachedLogs));
      } catch (_) {
        if (mounted) setHasLocalLogs(false);
      }
    };

    readLocalLogs();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUrl = ({ url }) => {
      if (typeof url === "string" && url.includes("/log/meal")) {
        navigation?.navigate("MealEntry", { openCamera: true });
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription?.remove?.();
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch?.();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const insets = useSafeAreaInsets();
  const stapleSummary = Array.isArray(userData?.typicalStaples)
    ? userData.typicalStaples.slice(0, 3).join(", ")
    : "";

  if (loading || hasLocalLogs === null) {
    return (
      <View
        style={[styles.loadingState, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading your home...
        </Text>
      </View>
    );
  }

  if (!hasLogs && !hasLocalLogs) {
    return (
      <ErrorBoundary>
        <EmptyStateHomeScreen navigation={navigation} userData={userData} />
      </ErrorBoundary>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: THEME_COLORS.background }]}
    >
      <AnimatedScreen style={styles.flexOne}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 100 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || loading}
              onRefresh={onRefresh}
              tintColor={THEME_COLORS.primary}
            />
          }
        >
          <Header
            userData={{
              name:
                userData?.name ||
                [userData?.firstName, userData?.lastName]
                  .filter(Boolean)
                  .join(" "),
              firstName: userData?.firstName,
              photoURL: userData?.photoURL || userData?.profileImage,
            }}
            onBellPress={() => setShowNotifications(true)}
          />

          {/* Main Insight Section */}
          <View style={styles.insightSection}>
            <Text style={styles.insightTitle}>
              {stapleSummary
                ? `Your usual staples include ${stapleSummary}.`
                : "Your afternoon energy improved significantly after increasing hydration yesterday."}
            </Text>
            <Text style={styles.insightBody}>
              {stapleSummary
                ? "That gives Reversia a better starting point for meal suggestions and meal logging."
                : "Let's keep that momentum going today. A glass of water before your afternoon tea could help stabilize your energy until evening."}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate("MealEntry", { openCamera: true })
              }
            >
              <LucideIcon
                name="coffee"
                size={18}
                color={THEME_COLORS.primaryForeground}
                style={styles.buttonIcon}
              />
              <Text style={styles.primaryButtonText}>
                {stapleSummary ? "Log a Meal" : "Log Hydration"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rest & Recovery Card */}
          <View style={styles.recoveryCard}>
            <View style={styles.cardHeaderRow}>
              <View
                style={[
                  styles.cardIconWrapper,
                  { backgroundColor: "rgba(121, 140, 115, 0.15)" },
                ]}
              >
                <LucideIcon
                  name="moon"
                  size={22}
                  color={THEME_COLORS.secondary}
                />
              </View>
              <View style={styles.cardContentBlock}>
                <Text style={styles.cardHeading}>Rest & Recovery</Text>
                <Text style={styles.cardDescription}>
                  Your sleep quality appears to be improving your glucose
                  stability. The 7.5 hours of rest you got last night has set a
                  strong foundation for your metabolism today.
                </Text>
                <View style={styles.metricRow}>
                  <LucideIcon
                    name="trending-up"
                    size={16}
                    color={THEME_COLORS.secondary}
                  />
                  <Text style={styles.metricText}>
                    +15% better recovery than last week
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Patterns Horizonal Section */}
          <View style={styles.patternsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Patterns</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Details")}>
                <Text style={styles.seeDetailsText}>See details</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollGap}
            >
              {/* Pattern Card 1 */}
              <View style={styles.patternCard}>
                <View style={styles.patternHeaderRow}>
                  <View
                    style={[
                      styles.patternIconBox,
                      { backgroundColor: "rgba(226, 138, 130, 0.15)" },
                    ]}
                  >
                    <LucideIcon
                      name="pie-chart"
                      size={18}
                      color={THEME_COLORS.destructive}
                    />
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: "rgba(226, 138, 130, 0.1)" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: THEME_COLORS.destructive },
                      ]}
                    >
                      Observation
                    </Text>
                  </View>
                </View>
                <Text style={styles.patternCardTitle}>Evening Meals</Text>
                <Text style={styles.patternCardBody}>
                  Late evening garri meals may be contributing to mild overnight
                  glucose spikes. Consider having lighter dinners earlier.
                </Text>
              </View>

              {/* Pattern Card 2 */}
              <View style={styles.patternCard}>
                <View style={styles.patternHeaderRow}>
                  <View
                    style={[
                      styles.patternIconBox,
                      { backgroundColor: "rgba(224, 122, 95, 0.15)" },
                    ]}
                  >
                    <LucideIcon
                      name="activity"
                      size={18}
                      color={THEME_COLORS.primary}
                    />
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: "rgba(224, 122, 95, 0.1)" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: THEME_COLORS.primary },
                      ]}
                    >
                      Positive
                    </Text>
                  </View>
                </View>
                <Text style={styles.patternCardTitle}>Post-meal Movement</Text>
                <Text style={styles.patternCardBody}>
                  Your short walks after lunch are effectively keeping your
                  afternoon energy levels stable. Great habit!
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Weekly Wellness Block */}
          <View style={styles.weeklyWellnessCard}>
            <Text style={styles.cardHeading}>Weekly Wellness</Text>
            <Text style={[styles.cardDescription, { marginBottom: 20 }]}>
              You're building wonderful consistency. Just two more days of
              mindful evening meals to reach your target.
            </Text>

            {/* Progress Bar 1 */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Mindful Dinners</Text>
                <Text style={styles.progressValue}>5/7 days</Text>
              </View>
              <View style={styles.progressTrackBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "71%", backgroundColor: THEME_COLORS.primary },
                  ]}
                />
              </View>
            </View>

            {/* Progress Bar 2 */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Hydration</Text>
                <Text style={styles.progressValue}>3/5 days</Text>
              </View>
              <View style={styles.progressTrackBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "60%", backgroundColor: THEME_COLORS.secondary },
                  ]}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </AnimatedScreen>

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
}

function createStyles(THEME_COLORS, typography) {
  const bodyFont =
    typography?.body ||
    Platform.select({ ios: "System", android: "sans-serif", web: "system-ui" });
  const headingFont =
    typography?.heading ||
    Platform.select({ ios: "System", android: "sans-serif", web: "system-ui" });

  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    flexOne: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 16,
      gap: 32,
    },
    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      fontFamily: bodyFont,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 6,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 0,
      borderColor: THEME_COLORS.borderSurface,
    },
    greetingText: {
      fontFamily: bodyFont,
      fontSize: 13,
      fontWeight: "400",
      color: THEME_COLORS.mutedTextColor,
    },
    profileName: {
      fontFamily: bodyFont,
      fontSize: 16,
      fontWeight: "600",
      color: THEME_COLORS.foreground,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: THEME_COLORS.cardBackground,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: THEME_COLORS.primary,
    },
    insightSection: {
      gap: 12,
      marginTop: 4,
    },
    insightTitle: {
      fontFamily: headingFont,
      fontSize: 36,
      fontWeight: "500",
      lineHeight: 44,
      letterSpacing: -0.5,
      color: THEME_COLORS.foreground,
    },
    insightBody: {
      fontFamily: bodyFont,
      fontSize: 18,
      lineHeight: 28,
      color: THEME_COLORS.mutedTextColor,
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: THEME_COLORS.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 999,
      marginTop: 6,
      shadowColor: THEME_COLORS.primary,
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    buttonIcon: {
      marginRight: 8,
    },
    primaryButtonText: {
      fontFamily: bodyFont,
      fontSize: 15,
      fontWeight: "600",
      color: THEME_COLORS.primaryForeground,
    },
    recoveryCard: {
      backgroundColor: THEME_COLORS.cardBackground,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: THEME_COLORS.borderSurface,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
    },
    cardIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    cardContentBlock: {
      flex: 1,
    },
    cardHeading: {
      fontFamily: headingFont,
      fontSize: 20,
      fontWeight: "600",
      color: THEME_COLORS.foreground,
      marginBottom: 8,
    },
    cardDescription: {
      fontFamily: bodyFont,
      fontSize: 15,
      lineHeight: 22,
      color: THEME_COLORS.mutedTextColor,
    },
    metricRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
    },
    metricText: {
      fontFamily: bodyFont,
      fontSize: 13,
      fontWeight: "500",
      color: THEME_COLORS.secondary,
    },
    patternsSection: {
      gap: 14,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 8,
    },
    sectionTitle: {
      fontFamily: headingFont,
      fontSize: 24,
      fontWeight: "500",
      color: THEME_COLORS.foreground,
    },
    seeDetailsText: {
      fontFamily: bodyFont,
      fontSize: 14,
      fontWeight: "500",
      color: THEME_COLORS.primary,
    },
    horizontalScrollGap: {
      gap: 16,
      paddingRight: 24,
    },
    patternCard: {
      backgroundColor: THEME_COLORS.cardBackground,
      borderRadius: 24,
      padding: 20,
      width: 280,
      borderWidth: 1,
      borderColor: THEME_COLORS.borderSurface,
    },
    patternHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    patternIconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 100,
    },
    badgeText: {
      fontFamily: bodyFont,
      fontSize: 12,
      fontWeight: "500",
    },
    patternCardTitle: {
      fontFamily: headingFont,
      fontSize: 18,
      fontWeight: "500",
      color: THEME_COLORS.foreground,
      marginBottom: 4,
    },
    patternCardBody: {
      fontFamily: bodyFont,
      fontSize: 14,
      lineHeight: 20,
      color: THEME_COLORS.mutedTextColor,
    },
    weeklyWellnessCard: {
      backgroundColor: THEME_COLORS.cardBackground,
      borderRadius: 32,
      padding: 24,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: THEME_COLORS.borderSurface,
    },
    progressBarContainer: {
      marginBottom: 16,
    },
    progressLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressLabel: {
      fontFamily: bodyFont,
      fontSize: 14,
      fontWeight: "500",
      color: THEME_COLORS.foreground,
    },
    progressValue: {
      fontFamily: bodyFont,
      fontSize: 14,
      color: THEME_COLORS.mutedTextColor,
    },
    progressTrackBackground: {
      height: 8,
      width: "100%",
      backgroundColor: THEME_COLORS.background,
      borderRadius: 100,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 100,
    },
  });
}
