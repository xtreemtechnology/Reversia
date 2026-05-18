import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { ContinueButton } from "../components/ContinueButton";
import { ErrorBox } from "../components/ErrorBox";
import { saveAge } from "../services/onboardingService";
import { useTheme } from "../../../theme/ThemeProvider";
import ROUTES from "../../../navigation/routeNames";

const TICK_SPACING = 20;
const MIN_AGE = 18;
const MAX_AGE = 99;

export default function AccountSetupAge({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const rulerPadding = Math.max(8, screenWidth / 2 - TICK_SPACING / 2);
  const [selectedAge, setSelectedAge] = useState(27);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const ages = Array.from(
    { length: MAX_AGE - MIN_AGE + 1 },
    (_, i) => i + MIN_AGE
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const initialOffset = (selectedAge - MIN_AGE) * TICK_SPACING;
      scrollRef.current?.scrollTo({ x: initialOffset, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      await saveAge(selectedAge);
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_WEIGHT);
    } catch (err) {
      console.error("Error saving age:", err);
      setError("Could not save your age. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const nextAge = Math.round(xOffset / TICK_SPACING) + MIN_AGE;
    if (nextAge !== selectedAge && nextAge >= MIN_AGE && nextAge <= MAX_AGE) {
      setSelectedAge(nextAge);
    }
  };

  const renderTick = (item) => {
    const isSelected = item === selectedAge;
    const isMajorTick = item % 5 === 0;
    return (
      <TouchableOpacity
        key={item}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedAge(item);
          scrollRef.current?.scrollTo({
            x: (item - MIN_AGE) * TICK_SPACING,
            animated: true,
          });
        }}
        style={styles.tickWrapper}
      >
        <View
          style={[
            styles.tickLine,
            isMajorTick ? styles.longTick : styles.shortTick,
            isSelected && styles.activeTickLine,
          ]}
        />
        {isMajorTick && <Text style={styles.tickLabel}>{item}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <OnboardingProgress current={3} />
        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>
          To give you a better experience we need to know your age
        </Text>

        <View style={styles.ageValueContainer}>
          <View style={styles.valueBox}>
            <Text style={styles.valueText}>{selectedAge}</Text>
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
            {ages.map(renderTick)}
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
    content: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 10,
      paddingTop: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 15,
    },
    subtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 60,
      paddingHorizontal: 20,
    },
    ageValueContainer: {
      alignItems: "center",
      marginBottom: 14,
    },
    valueBox: {
      backgroundColor: colors.card,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    valueText: {
      fontSize: 48,
      fontWeight: "800",
      color: colors.primary,
    },
    rulerContainer: {
      width: "100%",
      height: 120,
      marginBottom: 10,
    },
    rulerScroll: {},
    tickWrapper: {
      width: TICK_SPACING,
      alignItems: "center",
    },
    tickLine: {
      width: 2,
      backgroundColor: colors.border,
      borderRadius: 1,
    },
    shortTick: {
      height: 25,
    },
    longTick: {
      height: 45,
      backgroundColor: colors.border,
    },
    activeTickLine: {
      backgroundColor: colors.primary,
      width: 3,
    },
    tickLabel: {
      marginTop: 10,
      fontSize: 14,
      color: colors.muted,
      fontWeight: "700",
    },
    footer: {
      paddingHorizontal: 25,
      paddingBottom: 40,
    },
  });
