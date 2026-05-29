import React, { useEffect, useRef } from "react";
import { useIsFocused } from "@react-navigation/native";
import { Animated } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

// Wraps content and applies a subtle fade only when the tab gains focus.
export default function FocusAnimatedScreen({ children }) {
  const isFocused = useIsFocused();
  const { colors } = useTheme();

  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0.98)).current;

  useEffect(() => {
    if (isFocused) {
      opacity.setValue(0.98);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
      return;
    }

    opacity.setValue(0.98);
  }, [isFocused, opacity]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
}
