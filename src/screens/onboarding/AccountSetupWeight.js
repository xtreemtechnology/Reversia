import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";

// 1. FIREBASE IMPORTS
import { auth, db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";

const TICK_SPACING = 20;
const MIN_KG = 30;
const MIN_LB = 66;

export default function AccountSetupWeight({ navigation }) {
  const { colors } = useTheme();
  const [weight, setWeight] = useState(70); // Default to a standard weight
  const [unit, setUnit] = useState("kg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();
  const styles = getStyles(colors);
  const toggleWidth = Math.min(160, Math.max(120, screenWidth - 160));
  const valueBoxWidth = Math.min(220, Math.max(160, screenWidth - 120));
  const rulerPadding = Math.max(8, screenWidth / 2 - TICK_SPACING / 2);

  const minVal = unit === "kg" ? MIN_KG : MIN_LB;
  const maxVal = unit === "kg" ? 200 : 440;
  const rulerTicks = Array.from(
    { length: maxVal - minVal + 1 },
    (_, i) => i + minVal
  );

  // 2. INITIAL POSITION
  useEffect(() => {
    // Small timeout to ensure the ScrollView is mounted before scrolling
    const timer = setTimeout(() => {
      const initialOffset = (70 - MIN_KG) * TICK_SPACING;
      scrollRef.current?.scrollTo({ x: initialOffset, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 3. FIREBASE SAVE LOGIC
  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          weight: weight,
          weightUnit: unit,
          onboardingStep: 4,
          updatedAt: new Date().toISOString(),
        });
        navigation.navigate("AccountSetupHeight");
      }
    } catch (error) {
      console.log("Error saving weight:", error);
      setError("We couldn't save your weight. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (newUnit) => {
    if (newUnit === unit) {
      return;
    }

    let newWeight;
    if (newUnit === "lb") {
      newWeight = Math.round(weight * 2.20462);
    } else {
      newWeight = Math.round(weight / 2.20462);
    }

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.skipButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.progressText}>
          <Text style={styles.progressActive}>4</Text> / 8
        </Text>

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
          <AntDesign
            name="caretleft"
            size={24}
            color="#825CFF"
            style={styles.indicatorArrow}
          />
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

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueText}>Continue</Text>
              <AntDesign
                name="arrowright"
                size={20}
                color="#FFF"
                style={styles.icon}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    backButton: { padding: 8 },
    skipButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skipText: { fontSize: 14, color: colors.text, fontWeight: "500" },
    content: { flex: 1, alignItems: "center", paddingTop: 40 },
    progressText: {
      fontSize: 16,
      color: colors.muted,
      marginBottom: 20,
      fontWeight: "600",
    },
    progressActive: { color: colors.primary },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: colors.text,
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
      backgroundColor: colors.background === "#FFFFFF" ? "#F3F4FF" : "#3E3B5C",
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
    longTick: { height: 45, backgroundColor: colors.muted },
    activeTickLine: { backgroundColor: colors.primary, width: 3 },
    tickLabel: {
      marginTop: 10,
      fontSize: 14,
      color: colors.muted,
      fontWeight: "600",
    },
    errorBox: {
      width: "100%",
      marginTop: 16,
      marginBottom: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor: "#FEE2E2",
    },
    errorText: {
      color: "#B91C1C",
      textAlign: "center",
    },
    footer: { paddingHorizontal: 25, paddingBottom: 40 },
    continueButton: {
      backgroundColor: colors.primary,
      height: 65,
      borderRadius: 35,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    continueText: { color: colors.background, fontSize: 18, fontWeight: "700" },
    icon: { marginLeft: 10 },
  });
