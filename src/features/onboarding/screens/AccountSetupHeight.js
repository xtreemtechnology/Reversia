import React, { useState, useRef, useEffect } from "react";
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
// removed unused Ionicons import
import { OnboardingHeader } from "../components/OnboardingHeader";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { ContinueButton } from "../components/ContinueButton";
import { ErrorBox } from "../components/ErrorBox";
import { saveHeight } from "../services/onboardingService";
import { useTheme } from "../../../theme/ThemeProvider";
import ROUTES from "../../../navigation/routeNames";

const TICK_SPACING = 20;

export default function AccountSetupHeight({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [height, setHeight] = useState(170);
  const [unit, setUnit] = useState("cm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();
  const toggleWidth = Math.min(160, Math.max(120, screenWidth - 160));
  const valueBoxWidth = Math.min(240, Math.max(170, screenWidth - 110));
  const rulerPadding = Math.max(8, screenWidth / 2 - TICK_SPACING / 2);

  const minVal = unit === "cm" ? 100 : 3;
  const maxVal = unit === "cm" ? 250 : 8;
  const rulerTicks = Array.from(
    { length: maxVal - minVal + 1 },
    (_, i) => i + minVal
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const initialOffset = (170 - 100) * TICK_SPACING;
      scrollRef.current?.scrollTo({ x: initialOffset, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      await saveHeight(height, unit);
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_GOAL);
    } catch (err) {
      console.error("Error saving height:", err);
      setError("Could not save height. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (newUnit) => {
    if (newUnit === unit) {
      return;
    }
    let newHeight =
      newUnit === "ft"
        ? Math.round(height / 30.48)
        : Math.round(height * 30.48);
    setUnit(newUnit);
    setHeight(newHeight);
    const currentMin = newUnit === "cm" ? 100 : 3;
    const offset = (newHeight - currentMin) * TICK_SPACING;
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  };

  const handleScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const currentMin = unit === "cm" ? 100 : 3;
    const newHeight = Math.round(xOffset / TICK_SPACING) + currentMin;
    if (
      newHeight !== height &&
      newHeight >= currentMin &&
      newHeight <= maxVal
    ) {
      setHeight(newHeight);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <OnboardingProgress current={5} />
        <Text style={styles.title}>What is your height?</Text>
        <Text style={styles.subtitle}>
          Height is important for calculating your BMI and personalized activity
          goals.
        </Text>

        <View style={[styles.toggleContainer, { width: toggleWidth }]}>
          <TouchableOpacity
            style={[styles.toggleTab, unit === "ft" && styles.activeTab]}
            onPress={() => toggleUnit("ft")}
          >
            <Text
              style={[
                styles.toggleText,
                unit === "ft" && styles.activeToggleText,
              ]}
            >
              ft
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleTab, unit === "cm" && styles.activeTab]}
            onPress={() => toggleUnit("cm")}
          >
            <Text
              style={[
                styles.toggleText,
                unit === "cm" && styles.activeToggleText,
              ]}
            >
              cm
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.valueDisplayContainer}>
          <View style={[styles.valueBox, { minWidth: valueBoxWidth }]}>
            <Text style={styles.valueText}>
              {height} <Text style={{ fontSize: 20 }}>{unit}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.rulerContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={TICK_SPACING}
            decelerationRate="fast"
            contentContainerStyle={[
              styles.rulerScroll,
              { paddingHorizontal: rulerPadding },
            ]}
          >
            {rulerTicks.map((tick) => (
              <View key={tick} style={styles.tickWrapper}>
                <View
                  style={[
                    styles.tickLine,
                    tick % 5 === 0 ? styles.longTick : styles.shortTick,
                    tick === height && styles.activeTickLine,
                  ]}
                />
                {tick % 5 === 0 && <Text style={styles.tickLabel}>{tick}</Text>}
              </View>
            ))}
          </ScrollView>
        </View>
        <ErrorBox error={error} />
      </View>

      <View style={styles.footer}>
        <ContinueButton onPress={handleContinue} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, alignItems: "center", paddingTop: 40 },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      paddingHorizontal: 40,
      marginBottom: 30,
    },
    toggleContainer: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 25,
      height: 45,
      padding: 4,
      marginBottom: 30,
    },
    toggleTab: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
    },
    activeTab: { backgroundColor: colors.primary },
    toggleText: { fontSize: 16, color: colors.muted, fontWeight: "600" },
    activeToggleText: { color: colors.background },
    valueDisplayContainer: { alignItems: "center", marginBottom: 14 },
    valueBox: {
      backgroundColor: colors.card,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 20,
      alignItems: "center",
    },
    valueText: { fontSize: 48, fontWeight: "700", color: colors.primary },
    rulerContainer: { width: "100%", height: 120 },
    rulerScroll: {},
    tickWrapper: { width: TICK_SPACING, alignItems: "center" },
    tickLine: { width: 2, backgroundColor: colors.border, borderRadius: 1 },
    shortTick: { height: 25 },
    longTick: { height: 45, backgroundColor: colors.border },
    activeTickLine: { backgroundColor: colors.primary, width: 3 },
    tickLabel: {
      marginTop: 10,
      fontSize: 14,
      color: colors.muted,
      fontWeight: "600",
    },
    footer: { paddingHorizontal: 25, paddingBottom: 40 },
  });
