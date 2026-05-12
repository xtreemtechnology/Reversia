// src/features/onboarding/screens/AccountSetupAge.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingHeader } from "../components/OnboardingHeader";
import { OnboardingProgress } from "../components/OnboardingProgress";
import { ContinueButton } from "../components/ContinueButton";
import { ErrorBox } from "../components/ErrorBox";
import { saveAge } from "../services/onboardingService";
import { useTheme } from "../../../theme/ThemeProvider";

const ITEM_WIDTH = 70;

export default function AccountSetupAge({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const listPadding = Math.max(8, screenWidth / 2 - ITEM_WIDTH / 2);
  const [selectedAge, setSelectedAge] = useState(27);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);

  const ages = Array.from({ length: 82 }, (_, i) => i + 18);

  const handleContinue = async () => {
    setError(null);
    setLoading(true);
    try {
      await saveAge(selectedAge);
      navigation.navigate("AccountSetupWeight");
    } catch (err) {
      console.error("Error saving age:", err);
      setError("Could not save your age. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    const nextIndex =
      direction === "left"
        ? ages.indexOf(selectedAge) - 1
        : ages.indexOf(selectedAge) + 1;

    if (nextIndex >= 0 && nextIndex < ages.length) {
      const nextAge = ages[nextIndex];
      setSelectedAge(nextAge);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const renderAgeItem = ({ item }) => {
    const isSelected = item === selectedAge;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setSelectedAge(item);
          flatListRef.current?.scrollToIndex({
            index: ages.indexOf(item),
            animated: true,
            viewPosition: 0.5,
          });
        }}
        style={[styles.ageItem, isSelected && styles.selectedAgeContainer]}
      >
        <Text style={[styles.ageText, isSelected && styles.selectedAgeText]}>
          {item}
        </Text>
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

        <View style={styles.pickerContainer}>
          <View
            style={[
              styles.pickerWrapper,
              { width: Math.min(screenWidth, 420) },
            ]}
          >
            <TouchableOpacity
              onPress={() => scroll("left")}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-back" size={30} color={colors.primary} />
            </TouchableOpacity>

            <FlatList
              ref={flatListRef}
              data={ages}
              renderItem={renderAgeItem}
              keyExtractor={(item) => item.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={[
                styles.listContent,
                { paddingHorizontal: listPadding },
              ]}
              initialScrollIndex={ages.indexOf(27)}
              getItemLayout={(data, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
            />

            <TouchableOpacity
              onPress={() => scroll("right")}
              style={styles.arrowButton}
            >
              <Ionicons
                name="chevron-forward"
                size={30}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.activeIndicator} />
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
    pickerContainer: {
      height: 120,
      alignItems: "center",
      justifyContent: "center",
    },
    pickerWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    listContent: {},
    ageItem: {
      width: ITEM_WIDTH,
      height: 80,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedAgeContainer: {
      backgroundColor: colors.card,
      borderRadius: 20,
    },
    ageText: {
      fontSize: 24,
      color: colors.border,
      fontWeight: "600",
    },
    selectedAgeText: {
      color: colors.primary,
      fontSize: 36,
      fontWeight: "800",
    },
    arrowButton: {
      padding: 10,
      zIndex: 10,
    },
    activeIndicator: {
      width: 40,
      height: 4,
      backgroundColor: colors.primary,
      borderRadius: 2,
      marginTop: 10,
    },
    footer: {
      paddingHorizontal: 25,
      paddingBottom: 40,
    },
  });
