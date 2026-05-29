import React, { useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Animated } from "react-native";
import { BlurView } from "expo-blur";
import SolarIcon from "../components/SolarIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottom = insets.bottom ? insets.bottom : 24;
  const wrapperStyle = [styles.wrapper, { bottom }];

  // Animated values for crossfade/scale per tab
  const animRef = useRef(
    state.routes.map((_, i) => new Animated.Value(state.index === i ? 1 : 0))
  );

  useEffect(() => {
    animRef.current.forEach((av, i) => {
      Animated.timing(av, {
        toValue: state.index === i ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={wrapperStyle}>
      <BlurView
        intensity={92}
        tint={colors.background === "#FDFBF9" ? "light" : "dark"}
        style={[
          styles.container,
          {
            borderColor: colors.border,
            backgroundColor:
              colors.background === "#FDFBF9"
                ? "rgba(255,255,255,0.82)"
                : "rgba(45,40,37,0.85)",
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconMap = {
            Home: focused ? "home-smile-bold" : "home-smile-bold-duotone",
            Track: focused ? "add-circle-bold" : "add-circle-bold-duotone",
            Learn: focused ? "book-bookmark-bold" : "book-bookmark-bold-duotone",
            Profile: focused ? "user-circle-bold" : "user-circle-bold-duotone",
          };

          const av = animRef.current[index];
          const opacity = av;
          const inverse = av.interpolate
            ? av.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
            : Animated.subtract(1, av);
          const scale = av.interpolate
            ? av.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] })
            : av;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.9}
              style={styles.item}
            >
              <View style={styles.iconWrap}>
                <Animated.View
                  style={[styles.iconAbsolute, { opacity, transform: [{ scale }] }]}
                >
                  <SolarIcon name={iconMap[route.name]} size={24} color={colors.primary} />
                </Animated.View>
                <Animated.View style={[styles.iconNormal, { opacity: inverse }]}> 
                  <SolarIcon name={iconMap[route.name]} size={24} color={colors.mutedForeground} />
                </Animated.View>
              </View>

              <View style={styles.labelWrap}>
                <Animated.Text
                  style={[styles.label, styles.labelAbsolute, { opacity, color: colors.primary }]}
                >
                  {label}
                </Animated.Text>
                <Animated.Text style={[styles.label, { opacity: inverse, color: colors.mutedForeground }]}> 
                  {label}
                </Animated.Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 24,
    right: 24,
    zIndex: 50,
  },
  container: {
    height: 74,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 10,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconWrap: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  iconAbsolute: { position: "absolute", left: 0, top: 0 },
  iconNormal: { left: 0, top: 0 },
  labelWrap: { height: 18, justifyContent: "center" },
  labelAbsolute: { position: "absolute" },
  label: { fontSize: 10, marginTop: 2, fontWeight: "600" },
});
