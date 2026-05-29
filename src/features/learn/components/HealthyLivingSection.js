import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";

export default function HealthyLivingSection({ delay = 270 }) {
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

  const gridItems = [
    {
      id: "recipes",
      iconName: "restaurant",
      iconColor: colors.primary,
      iconBg: colors.primary + "33",
      title: "Local Recipes",
      subtitle: "Low-impact traditional dishes",
    },
    {
      id: "community",
      iconName: "people",
      iconColor: colors.secondary,
      iconBg: colors.secondary + "33",
      title: "Community Tips",
      subtitle: "Insights from fellow travelers",
    },
  ];

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Healthy Living, Locally</Text>
      <View style={styles.grid}>
        {gridItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border + "80" },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.iconName} size={22} color={item.iconColor} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  grid: { flexDirection: "row", gap: 16 },
  card: { flex: 1, borderRadius: 28, padding: 16, borderWidth: 1, gap: 8 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: "500" },
  cardSubtitle: { fontSize: 12, lineHeight: 17 },
});
