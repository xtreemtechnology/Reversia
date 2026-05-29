import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Animated, { useSharedValue, withDelay, withTiming, useAnimatedStyle, Easing } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

const STORIES = [
  {
    id: "s1",
    name: "Amaka",
    quote: "Dropped my fasting sugar by 1.2 mmol/L in 3 months — small swaps mattered!",
    avatar: null,
  },
  {
    id: "s2",
    name: "Kwame",
    quote: "Swapping sweet drinks for herbal tea helped curb cravings.",
    avatar: null,
  },
  {
    id: "s3",
    name: "Zainab",
    quote: "The meal templates made it simple to plan local recipes.",
    avatar: null,
  },
];

export default function SuccessStories({ delay = 300 }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Text style={[styles.title, { color: colors.foreground }]}>Success Stories</Text>

      <View style={[styles.listWrap, { borderColor: colors.border + "80" }]}>
        {STORIES.map((s) => (
          <TouchableOpacity key={s.id} activeOpacity={0.8} style={[styles.card, { backgroundColor: colors.card }]}> 
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={colors.mutedForeground} />
            </View>

            <View style={styles.texts}>
              <Text style={[styles.name, { color: colors.foreground }]}>{s.name}</Text>
              <Text style={[styles.quote, { color: colors.mutedForeground }]} numberOfLines={2}>{s.quote}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  listWrap: { borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  card: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "transparent", borderWidth: 0 },
  texts: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" },
  quote: { fontSize: 13, marginTop: 4 },
});
