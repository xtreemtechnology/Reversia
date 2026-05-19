// src/components/LogWeightModal.js
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { auth, db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../theme/ThemeProvider";

const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const PICKER_H = ITEM_HEIGHT * VISIBLE_ITEMS;

// ─── Generate weight values ───────────────────────────────────────────────────
const KG_VALUES = Array.from({ length: 2201 }, (_, i) =>
  (30 + i * 0.1).toFixed(1)
); // 30.0 → 250.0
// DECIMAL_VALUES intentionally removed (unused)
const UNIT_VALUES = ["kg", "lbs"];

// ─── Scroll Wheel Picker ──────────────────────────────────────────────────────
const WheelPicker = ({
  items,
  selectedIndex,
  onIndexChange,
  width: pickerWidth = 80,
}) => {
  const { colors } = useTheme();
  const pickerStyles = getPickerStyles(colors);
  const scrollRef = useRef(null);
  const lastIndex = useRef(selectedIndex);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex]);

  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    if (clamped !== lastIndex.current) {
      lastIndex.current = clamped;
      onIndexChange(clamped);
    }
  };

  const handleMomentumEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    onIndexChange(clamped);
  };

  return (
    <View style={[pickerStyles.container, { width: pickerWidth }]}>
      {/* Selection highlight */}
      <View pointerEvents="none" style={pickerStyles.highlight} />

      {/* Fade top */}
      <View
        pointerEvents="none"
        style={[pickerStyles.fade, pickerStyles.fadeTop]}
      />
      {/* Fade bottom */}
      <View
        pointerEvents="none"
        style={[pickerStyles.fade, pickerStyles.fadeBottom]}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item, i) => {
          const isSelected = i === selectedIndex;
          return (
            <View key={i} style={pickerStyles.item}>
              <Text
                style={[
                  pickerStyles.itemText,
                  isSelected && pickerStyles.itemTextSelected,
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Theme-aware picker styles are provided by `getPickerStyles(colors)` below.

// ─── BMI Preview ──────────────────────────────────────────────────────────────
const BMIPreview = ({ weight, unit, height: userHeight = 175 }) => {
  const { colors } = useTheme();
  const bmiStyles = getBmiStyles(colors);
  const weightKg = unit === "lbs" ? weight * 0.453592 : weight;
  const bmi = (weightKg / (userHeight / 100) ** 2).toFixed(1);

  const getCategory = (b) => {
    if (b < 18.5) {
      return { label: "Underweight", color: colors.primary };
    }
    if (b < 25) {
      return { label: "Healthy", color: "#10B981" };
    }
    if (b < 30) {
      return { label: "Overweight", color: "#F59E0B" };
    }
    return { label: "Obese", color: "#EF4444" };
  };

  const cat = getCategory(parseFloat(bmi));

  return (
    <View style={bmiStyles.row}>
      <View style={bmiStyles.item}>
        <Text style={bmiStyles.label}>BMI</Text>
        <Text style={bmiStyles.value}>{bmi}</Text>
      </View>
      <View style={bmiStyles.divider} />
      <View style={bmiStyles.item}>
        <Text style={bmiStyles.label}>Category</Text>
        <Text style={[bmiStyles.value, { color: cat.color }]}>{cat.label}</Text>
      </View>
      <View style={bmiStyles.divider} />
      <View style={bmiStyles.item}>
        <Text style={bmiStyles.label}>Height</Text>
        <Text style={bmiStyles.value}>{userHeight} cm</Text>
      </View>
    </View>
  );
};

// BMI styles are provided by `getBmiStyles(colors)` below.

// ─── Trend Badge ──────────────────────────────────────────────────────────────
const TrendBadge = ({ current, previous }) => {
  const { colors } = useTheme();
  const trendStyles = getTrendStyles(colors);
  const diff = parseFloat((current - previous).toFixed(1));
  const isDown = diff < 0;
  const isNeutral = diff === 0;

  if (isNeutral) {
    return null;
  }

  return (
    <View
      style={[
        trendStyles.badge,
        { backgroundColor: isDown ? "#D1FAE5" : "#FEE2E2" },
      ]}
    >
      <MaterialCommunityIcons
        name={isDown ? "trending-down" : "trending-up"}
        size={14}
        color={isDown ? "#10B981" : "#EF4444"}
      />
      <Text
        style={[trendStyles.text, { color: isDown ? "#10B981" : "#EF4444" }]}
      >
        {isDown ? "" : "+"}
        {diff} kg from last log
      </Text>
    </View>
  );
};

// Theme-aware trend styles are provided by `getTrendStyles(colors)` below.

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function LogWeightModal({
  visible,
  onClose,
  onSaved,
  lastWeight = 82.4,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = Math.min(screenHeight * 0.88, 760);
  // Build integer & decimal parts from lastWeight (no local integer used)

  // KG_VALUES index for lastWeight
  const defaultKgIndex = KG_VALUES.findIndex(
    (v) => parseFloat(v) === parseFloat(lastWeight.toFixed(1))
  );

  const [wholeIndex, setWholeIndex] = useState(Math.max(defaultKgIndex, 0));
  // decimal index removed — current UI uses wholeIndex for 0.1 precision
  const [unitIndex, setUnitIndex] = useState(0); // 0 = kg
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState(null);

  const slideAnim = useRef(new Animated.Value(sheetHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Compute current weight from picker state
  const currentWeight = parseFloat((30 + wholeIndex * 0.1).toFixed(1));
  const unit = UNIT_VALUES[unitIndex];

  // Animate in/out
  useEffect(() => {
    if (visible) {
      setSaved(false);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: sheetHeight,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim, sheetHeight]);

  const handleSave = async () => {
    const user = auth.currentUser;
    setMessage(null);
    if (!user) {
      setMessage("Please log in first.");
      return;
    }

    setSaving(true);
    try {
      const weightInKg =
        unit === "lbs" ? currentWeight * 0.453592 : currentWeight;
      const bmi = (weightInKg / (175 / 100) ** 2).toFixed(1);

      await addDoc(collection(db, "weight_logs"), {
        userId: user.uid,
        weight: weightInKg,
        weightRaw: currentWeight,
        unit: unit,
        bmi: parseFloat(bmi),
        timestamp: serverTimestamp(),
      });

      setSaved(true);
      setTimeout(() => {
        onSaved?.({ weight: weightInKg, bmi: parseFloat(bmi) });
        onClose();
      }, 1200);
    } catch (err) {
      setMessage("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(0,0,0,0.45)",
            opacity: backdropAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetHeight, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Log Weight</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Date chip */}
          <View style={styles.dateChip}>
            <Ionicons name="calendar-outline" size={13} color={colors.muted} />
            <Text style={styles.dateChipText}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Trend */}
          <TrendBadge current={currentWeight} previous={lastWeight} />

          {/* Picker Row */}
          <View style={styles.pickerRow}>
            {/* Whole + decimal combined from KG_VALUES */}
            <View style={{ alignItems: "center" }}>
              <Text style={styles.pickerLabel}>Weight</Text>
              <WheelPicker
                items={KG_VALUES}
                selectedIndex={wholeIndex}
                onIndexChange={setWholeIndex}
                width={110}
              />
            </View>

            {/* Separator dot */}
            <Text style={styles.dot}>·</Text>

            {/* Unit picker */}
            <View style={{ alignItems: "center" }}>
              <Text style={styles.pickerLabel}>Unit</Text>
              <WheelPicker
                items={UNIT_VALUES}
                selectedIndex={unitIndex}
                onIndexChange={setUnitIndex}
                width={70}
              />
            </View>
          </View>

          {/* Large weight display */}
          <View style={styles.weightDisplay}>
            <Text style={styles.weightDisplayValue}>
              {currentWeight.toFixed(1)}
            </Text>
            <Text style={styles.weightDisplayUnit}>{unit}</Text>
          </View>

          {/* BMI Preview */}
          <BMIPreview weight={currentWeight} unit={unit} height={175} />

          {/* Save button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              saved && styles.saveBtnSuccess,
              saving && { opacity: 0.8 },
            ]}
            onPress={handleSave}
            disabled={saving || saved}
          >
            {saving ? (
              <ActivityIndicator color={colors.background} />
            ) : saved ? (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.background}
                />
                <Text style={styles.saveBtnText}>Saved!</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="scale-bathroom"
                  size={20}
                  color={colors.background}
                />
                <Text style={styles.saveBtnText}>Save Weight</Text>
              </>
            )}
          </TouchableOpacity>

          {message && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors) =>
  StyleSheet.create({
    sheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === "ios" ? 34 : 24,
      ...shadowStyle({
        color: colors.text,
        offsetY: -4,
        opacity: 0.15,
        radius: 20,
        elevation: 20,
      }),
    },
    sheetContent: {
      paddingBottom: 8,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 8,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
    },
    sheetTitle: { fontSize: 17, fontWeight: "800", color: colors.text },

    dateChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      alignSelf: "center",
      marginBottom: 16,
    },
    dateChipText: { fontSize: 13, fontWeight: "600", color: colors.text },

    pickerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    pickerLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.muted,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    dot: {
      fontSize: 32,
      color: colors.muted,
      marginTop: ITEM_HEIGHT * 2,
    },

    weightDisplay: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      marginBottom: 20,
    },
    weightDisplayValue: {
      fontSize: 48,
      fontWeight: "800",
      color: colors.text,
    },
    weightDisplayUnit: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.muted,
      marginLeft: 6,
    },

    saveBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 28,
      height: 56,
    },
    saveBtnSuccess: { backgroundColor: colors.primary },
    saveBtnText: { color: colors.background, fontWeight: "800", fontSize: 16 },
    messageBox: {
      backgroundColor: "#FEE2E2",
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
  });

const getPickerStyles = (colors) =>
  StyleSheet.create({
    container: {
      height: PICKER_H,
      overflow: "hidden",
      position: "relative",
    },
    highlight: {
      position: "absolute",
      top: ITEM_HEIGHT * 2,
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      backgroundColor: colors.card,
      borderRadius: 14,
      zIndex: 0,
    },
    fade: {
      position: "absolute",
      left: 0,
      right: 0,
      height: ITEM_HEIGHT * 2,
      zIndex: 2,
    },
    fadeTop: {
      top: 0,
      backgroundColor: colors.background,
      opacity: 0.92,
    },
    fadeBottom: {
      bottom: 0,
      backgroundColor: colors.background,
      opacity: 0.92,
    },
    item: {
      height: ITEM_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
    },
    itemText: {
      fontSize: 20,
      fontWeight: "500",
      color: colors.border,
    },
    itemTextSelected: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
    },
  });

const getBmiStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      justifyContent: "space-around",
      marginBottom: 20,
    },
    item: { alignItems: "center" },
    label: {
      fontSize: 11,
      color: colors.muted,
      fontWeight: "600",
      marginBottom: 4,
    },
    value: { fontSize: 16, fontWeight: "800", color: colors.text },
    divider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  });

const getTrendStyles = (colors) =>
  StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: "center",
      marginBottom: 20,
    },
    text: { fontSize: 12, fontWeight: "700" },
  });
