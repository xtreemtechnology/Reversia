import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import AIGuideModal from "./AIGuideModal";

export default function GuideQuestionCard({ delay = 90 }) {
  const { colors } = useTheme();
  const [question, setQuestion] = useState("");
  const [showModal, setShowModal] = useState(false);
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
    <Animated.View
      style={[
        styles.card,
        animStyle,
        { backgroundColor: colors.card, borderColor: colors.border + "80" },
      ]}
    >
      <View style={[styles.glowBlob, { backgroundColor: colors.primary + "1A" }]} />
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}> 
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
        </View>

        <View style={styles.content}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Ask your Reversia Guide</Text>
          <Text style={[styles.prompt, { color: colors.foreground + "CC" }]}>"How should I balance a Sunday Rice &amp; Stew meal for better energy?"</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Type your question..."
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => {
                if (!question.trim()) return;
                setShowModal(true);
              }}
            >
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <AIGuideModal visible={showModal} question={question} onClose={() => setShowModal(false)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  glowBlob: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    zIndex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  prompt: {
    fontSize: 13,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 50,
    fontSize: 14,
  },
  sendBtn: {
    position: "absolute",
    right: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
