import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import T from "../../../theme/tokens";
import ROUTES from "../../../navigation/routeNames";

export default function SplashScreen({ navigation }) {
  const logo = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const tagFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logo, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 7,
      }),
      Animated.timing(word, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),
      Animated.timing(tagFade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(
      () => navigation.replace(ROUTES.ONBOARDING.WELCOME),
      2500
    );
    return () => clearTimeout(t);
  }, [logo, navigation, tagFade, word]);

  const logoScale = logo.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });
  const logoOpacity = logo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: T.BG,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <Animated.View
        style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 32,
            backgroundColor: T.PRIMARY,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="leaf" size={46} color={T.WHITE} />
        </View>
      </Animated.View>
      <Animated.Text
        style={{
          fontSize: 38,
          fontWeight: "800",
          color: T.TEXT,
          letterSpacing: -1,
          opacity: word,
        }}
      >
        Reversia
      </Animated.Text>
      <Animated.Text
        style={{
          fontSize: 15,
          color: T.MUTED,
          fontWeight: "500",
          opacity: tagFade,
        }}
      >
        Reverse diabetes, naturally.
      </Animated.Text>
    </View>
  );
}
