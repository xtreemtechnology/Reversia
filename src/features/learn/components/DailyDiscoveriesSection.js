import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";

export default function DailyDiscoveriesSection({ delay = 180 }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Discoveries</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: colors.primary }]}>View all</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.articleCard,
          { backgroundColor: colors.card, borderColor: colors.border + "80" },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/auM5Ws2biQE/components/TTGefxwA7uh.png",
            }}
            style={styles.articleImage}
            resizeMode="cover"
          />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.imageOverlay}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}> 
              <Text style={styles.badgeText}>LOCAL FOOD INTELLIGENCE</Text>
            </View>
            <Text style={styles.articleTitle}>How Garri affects blood sugar</Text>
          </View>
        </View>

        <View style={styles.articleBody}>
          <Text style={[styles.articleExcerpt, { color: colors.mutedForeground }]}>Garri is a staple, but its impact depends on how it's prepared. Adding more protein (like fish) and fiber (like vegetables) can slow glucose absorption...</Text>
          <View style={styles.readMore}>
            <Text style={[styles.readMoreText, { color: colors.primary }]}>Read the 3-minute guide</Text>
            <Ionicons name="arrow-forward-outline" size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>

      <View
        style={[
          styles.stabilityCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border + "80",
            borderLeftColor: colors.secondary,
          },
        ]}
      >
        <View style={styles.stabilityRow}>
          <View style={[styles.stabilityIcon, { backgroundColor: colors.secondary + "1A" }]}>
            <Ionicons name="stats-chart" size={22} color={colors.secondary} />
          </View>
          <View style={styles.stabilityContent}>
            <Text style={[styles.stabilityTitle, { color: colors.foreground }]}>Your Glucose Stability Trend</Text>
            <Text style={[styles.stabilityBody, { color: colors.mutedForeground }]}>We've noticed your stability is 22% higher on days you include local fiber sources like Okra or Ewedu in your main meal.</Text>
            <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.secondary + "1A" }]}>
              <Text style={[styles.exploreBtnText, { color: colors.secondary }]}>EXPLORE THE DATA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  viewAll: { fontSize: 14, fontWeight: "500" },
  articleCard: { borderRadius: 32, overflow: "hidden", borderWidth: 1 },
  imageContainer: { height: 192, position: "relative" },
  articleImage: { width: "100%", height: "100%" },
  imageOverlay: { position: "absolute", bottom: 16, left: 20, right: 20, gap: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  articleTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "600", fontFamily: "PlusJakartaSans_600SemiBold" },
  articleBody: { padding: 20, gap: 12 },
  articleExcerpt: { fontSize: 14, lineHeight: 22 },
  readMore: { flexDirection: "row", alignItems: "center", gap: 6 },
  readMoreText: { fontSize: 14, fontWeight: "500" },
  stabilityCard: { borderRadius: 32, padding: 20, borderWidth: 1, borderLeftWidth: 4 },
  stabilityRow: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  stabilityIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stabilityContent: { flex: 1, gap: 10 },
  stabilityTitle: { fontSize: 16, fontWeight: "600", fontFamily: "PlusJakartaSans_600SemiBold" },
  stabilityBody: { fontSize: 13, lineHeight: 20 },
  exploreBtn: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  exploreBtnText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
});
