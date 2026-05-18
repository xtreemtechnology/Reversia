import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { ContinueButton } from "../components/ContinueButton";
import { ErrorBox } from "../components/ErrorBox";
import { saveWeight } from "../services/onboardingService";
import { useTheme } from "../../../theme/ThemeProvider";
import ROUTES from "../../../navigation/routeNames";

const TICK_SPACING = 20;
const MIN_KG = 30;
const MIN_LB = 66;

export default function AccountSetupWeight({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [weight, setWeight] = useState(70);
  const [unit, setUnit] = useState("kg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();
  const toggleWidth = Math.min(160, Math.max(120, screenWidth - 160));
  const valueBoxWidth = Math.min(220, Math.max(160, screenWidth - 120));
  const rulerPadding = Math.max(8, screenWidth / 2 - TICK_SPACING / 2);

  const minVal = unit === "kg" ? MIN_KG : MIN_LB;
  const maxVal = unit === "kg" ? 200 : 440;
  const rulerTicks = Array.from(
    { length: maxVal - minVal + 1 },
    (_, i) => i + minVal
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const initialOffset = (70 - MIN_KG) * TICK_SPACING;
      scrollRef.current?.scrollTo({ x: initialOffset, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      await saveWeight(weight, unit);
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_HEIGHT);
    } catch (err) {
      console.error("Error saving weight:", err);
      setError("We couldn't save your weight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (newUnit) => {
    if (newUnit === unit) return;
    let newWeight =
      newUnit === "lb"
        ? Math.round(weight * 2.20462)
        : Math.round(weight / 2.20462);
    setUnit(newUnit);
    setWeight(newWeight);
    const currentMin = newUnit === "kg" ? MIN_KG : MIN_LB;
    const offset = (newWeight - currentMin) * TICK_SPACING;
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  };

  const handleScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const currentMin = unit === "kg" ? MIN_KG : MIN_LB;
    const newWeight = Math.round(xOffset / TICK_SPACING) + currentMin;
    if (
      newWeight !== weight &&
      newWeight >= currentMin &&
      newWeight <= maxVal
    ) {
      setWeight(newWeight);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <OnboardingProgress current={4} />
        <Text style={styles.title}>What is your weight?</Text>
        <Text style={styles.subtitle}>
          Your weight helps us calculate your calorie and activity needs
          accurately.
        </Text>

        <View style={[styles.toggleContainer, { width: toggleWidth }]}>
          <TouchableOpacity
            style={[styles.toggleTab, unit === "lb" && styles.activeTab]}
            onPress={() => toggleUnit("lb")}
          >
            <Text
              style={[
                styles.toggleText,
                unit === "lb" && styles.activeToggleText,
              ]}
            >
              lb
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleTab, unit === "kg" && styles.activeTab]}
            onPress={() => toggleUnit("kg")}
          >
            <Text
              style={[
                styles.toggleText,
                unit === "kg" && styles.activeToggleText,
              ]}
            >
              kg
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weightValueContainer}>
          <View style={[styles.valueBox, { minWidth: valueBoxWidth }]}>
            <Text style={styles.valueText}>{weight}</Text>
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
                    tick === weight && styles.activeTickLine,
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
    weightValueContainer: { alignItems: "center", marginBottom: 20 },
    indicatorArrow: { transform: [{ rotate: "270deg" }], marginBottom: 5 },
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
