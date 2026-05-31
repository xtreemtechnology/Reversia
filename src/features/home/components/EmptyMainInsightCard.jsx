import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AccessibilityInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function EmptyMainInsightCard({ navigation }) {
  const { colors, typography } = useTheme();
  const fullText = "Your story begins here.";
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let charInterval = null;
    let blinkInterval = null;

    const run = async () => {
      const reduce = await AccessibilityInfo.isReduceMotionEnabled();
      if (!mounted) return;
      if (reduce) {
        setDisplayedText(fullText);
        setCursorVisible(false);
        finishedRef.current = true;
        setFinished(true);
        return;
      }

      setDisplayedText("");
      setCursorVisible(true);
      // Start blinking cursor while typing
      blinkInterval = setInterval(() => setCursorVisible((v) => !v), 500);

      let i = 0;
      const typingSpeed = 65; // ms per char (slower)
      charInterval = setInterval(() => {
        i += 1;
        setDisplayedText(fullText.slice(0, i));
        if (i >= fullText.length) {
          finishedRef.current = true;
          setFinished(true);
          if (charInterval) clearInterval(charInterval);
          // keep cursor blinking briefly then hide
          setTimeout(() => {
            if (blinkInterval) clearInterval(blinkInterval);
            setCursorVisible(false);
          }, 1600);
        }
      }, typingSpeed);
    };

    run();

    return () => {
      mounted = false;
      if (charInterval) clearInterval(charInterval);
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, []);

  useEffect(() => {
    if (finished && displayedText) {
      AccessibilityInfo.announceForAccessibility(displayedText);
    }
  }, [finished, displayedText]);

  return (
    <View style={[styles.container]}>
      <Text
        accessible
        accessibilityRole="header"
        style={[
          styles.headline,
          {
            color: colors.foreground,
            fontFamily: typography?.headingMedium || typography?.heading,
          },
        ]}
      >
        {displayedText}
        {!finished && cursorVisible ? "|" : ""}
      </Text>
      <Text
        style={[
          styles.body,
          { color: colors.mutedForeground, fontFamily: typography?.body },
        ]}
      >
        Every meal, glass of water, and night of sleep helps Reversia understand
        you.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={() => navigation?.navigate("Track")}
      >
        <Ionicons name="cafe" size={18} color={colors.primaryForeground} />
        <Text
          style={[
            styles.buttonText,
            { color: colors.primaryForeground, fontFamily: typography?.medium },
          ]}
        >
          Log your first meal
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "flex-start",
    width: "100%",
    maxWidth: 480,
  },
  headline: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "500",
    letterSpacing: -0.5,
    maxWidth: 440,
  },
  body: {
    fontSize: 18,
    lineHeight: 28,
    marginTop: 6,
    maxWidth: 440,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
