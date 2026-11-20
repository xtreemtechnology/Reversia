// src/features/onboarding/post-onboarding/SetupSteps.jsx
//
// The eight question screens of the stepped setup flow (Figma kit
// screens 14–21, layout only — Reversia palette and copy). Each screen
// is a controlled input: it renders its value and calls onChange.
// The orchestrator owns the answers state, the header and the button.

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, T } from "../../../theme/tokens";
import ILLUSTRATIONS from "../../illustrations/illustrations";
import { PRIMARY_GOAL_OPTIONS } from "../../reversal/data/planData";
import { DEEP_GREEN } from "./SetupChrome";
import { SetupRuler, UnitToggle, ValueBox } from "./SetupRuler";
import { formatWeight, formatHeight, kgToLbs } from "./setupFormat";

// ── Step 1 · Name ────────────────────────────────────────────────────────────

export function NameStep({ value, onChange }) {
  return (
    <View style={styles.stepBody}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Your full name"
        placeholderTextColor={T.MUTED}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        style={styles.nameInput}
        accessibilityLabel="Your full name"
      />
    </View>
  );
}

// ── Step 2 · Gender ──────────────────────────────────────────────────────────

const GENDER_CARDS = [
  { value: "male", label: "Male", art: "gender-male" },
  { value: "female", label: "Female", art: "gender-female" },
];

export function GenderStep({ value, onChange }) {
  return (
    <View style={styles.stepBody}>
      <View style={styles.genderRow}>
        {GENDER_CARDS.map((card) => {
          const selected = value === card.value;
          return (
            <TouchableOpacity
              key={card.value}
              onPress={() => onChange(card.value)}
              activeOpacity={0.85}
              style={[styles.genderCard, selected && styles.genderCardSelected]}
              accessibilityLabel={card.label}
            >
              <Image
                source={ILLUSTRATIONS[card.art]}
                style={styles.genderImage}
                resizeMode="contain"
              />
              {selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={26}
                  color={DEEP_GREEN}
                  style={styles.genderCheck}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.genderRow}>
        {GENDER_CARDS.map((card) => (
          <Text key={card.value} style={styles.genderLabel}>
            {card.label}
          </Text>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => onChange("prefer_not_to_say")}
        activeOpacity={0.7}
        style={styles.preferNotRow}
        accessibilityLabel="Prefer not to say"
      >
        {value === "prefer_not_to_say" ? (
          <Ionicons name="checkmark" size={16} color={DEEP_GREEN} />
        ) : null}
        <Text
          style={[
            styles.preferNotText,
            value === "prefer_not_to_say" && styles.preferNotTextSelected,
          ]}
        >
          Prefer not to say
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step 3 · Age ─────────────────────────────────────────────────────────────

const AGE_MIN = 18;
const AGE_MAX = 100;

export function AgeStep({ value, onChange }) {
  const step = (delta) => {
    const next = Math.min(AGE_MAX, Math.max(AGE_MIN, value + delta));
    onChange(next);
  };
  return (
    <View style={styles.stepBody}>
      <View style={styles.ageRow}>
        <TouchableOpacity
          onPress={() => step(-1)}
          disabled={value <= AGE_MIN}
          activeOpacity={0.6}
          style={[
            styles.ageChevron,
            value <= AGE_MIN && styles.ageChevronDisabled,
          ]}
          accessibilityLabel="One year younger"
        >
          <Ionicons name="chevron-back" size={28} color={T.TEXT} />
        </TouchableOpacity>
        <View style={styles.ageRulerWrap}>
          <SetupRuler
            min={AGE_MIN}
            max={AGE_MAX}
            value={value}
            onChange={onChange}
            variant="numbers"
            itemWidth={56}
          />
        </View>
        <TouchableOpacity
          onPress={() => step(1)}
          disabled={value >= AGE_MAX}
          activeOpacity={0.6}
          style={[
            styles.ageChevron,
            value >= AGE_MAX && styles.ageChevronDisabled,
          ]}
          accessibilityLabel="One year older"
        >
          <Ionicons name="chevron-forward" size={28} color={T.TEXT} />
        </TouchableOpacity>
      </View>
      <Text style={styles.ageUnit}>years old</Text>
    </View>
  );
}

// ── Steps 4 & 5 · Weight / Height (same layout) ─────────────────────────────

export function MeasureStep({
  value,
  onChange,
  unit,
  onUnitChange,
  units,
  min,
  max,
  displayValue,
  unitLabel,
  formatValue,
}) {
  return (
    <View style={styles.stepBody}>
      <UnitToggle units={units} value={unit} onChange={onUnitChange} />
      <View style={styles.pointerWrap}>
        <Ionicons name="caret-down" size={18} color={DEEP_GREEN} />
      </View>
      <View style={styles.measureValue}>
        <ValueBox displayValue={displayValue} unitLabel={unitLabel} />
      </View>
      <SetupRuler
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        variant="ticks"
        labelEvery={5}
        itemWidth={12}
        formatLabel={formatValue}
      />
    </View>
  );
}

// ── Step 6 · Goal ────────────────────────────────────────────────────────────

const GOAL_ICONS = {
  lower_fasting: "pulse-outline",
  lower_hba1c: "flask-outline",
  eat_natural: "leaf-outline",
  feel_energized: "flash-outline",
};

export function GoalStep({ value, onChange }) {
  return (
    <View style={styles.stepBody}>
      {PRIMARY_GOAL_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.85}
            style={[styles.optionRow, selected && styles.optionRowSelected]}
            accessibilityLabel={option.label}
          >
            <View style={styles.optionIcon}>
              <Ionicons
                name={GOAL_ICONS[option.value] || "checkmark"}
                size={26}
                color={DEEP_GREEN}
              />
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
            {selected ? (
              <Ionicons name="checkbox" size={24} color={DEEP_GREEN} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Step 7 · Target weight ───────────────────────────────────────────────────

export function TargetWeightStep({
  currentKg,
  targetKg,
  onTargetChange,
  unit,
  onUnitChange,
}) {
  const displayNumber = (kg) =>
    unit === "lbs" ? String(kgToLbs(kg)) : String(kg);
  return (
    <View style={styles.stepBody}>
      <UnitToggle
        units={[
          { value: "kg", label: "kg" },
          { value: "lbs", label: "lbs" },
        ]}
        value={unit}
        onChange={onUnitChange}
      />
      <View style={styles.targetRow}>
        <View style={styles.targetBoxWrap}>
          <ValueBox displayValue={displayNumber(currentKg)} unitLabel={unit} />
          <Text style={styles.targetCaption}>Now</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={T.MUTED} />
        <View style={styles.targetBoxWrap}>
          <ValueBox
            displayValue={displayNumber(targetKg)}
            unitLabel={unit}
            highlighted
          />
          <Text style={styles.targetCaption}>Target</Text>
        </View>
      </View>
      <SetupRuler
        min={30}
        max={200}
        value={targetKg}
        onChange={onTargetChange}
        variant="ticks"
        labelEvery={5}
        itemWidth={12}
        formatLabel={(v) => displayNumber(v)}
      />
    </View>
  );
}

// ── Step 8 · Journey ─────────────────────────────────────────────────────────

export const JOURNEY_OPTIONS = [
  {
    value: "steady",
    title: "Steady start",
    description: "Small changes, build slowly",
  },
  {
    value: "balanced",
    title: "Balanced",
    description: "A steady weekly routine",
  },
  {
    value: "full",
    title: "Full commitment",
    description: "Daily logging and check-ins",
  },
];

export function JourneyStep({ value, onChange }) {
  return (
    <View style={styles.stepBody}>
      {JOURNEY_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.85}
            style={[
              styles.optionRow,
              styles.journeyRow,
              selected && styles.optionRowSelected,
            ]}
            accessibilityLabel={option.title}
          >
            <View style={styles.journeyText}>
              <Text style={styles.journeyTitle}>{option.title}</Text>
              <Text style={styles.journeyDescription}>
                {option.description}
              </Text>
            </View>
            {selected ? (
              <Ionicons name="checkbox" size={24} color={DEEP_GREEN} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Shared value formatters for the weight / height steps, so the
// orchestrator and the preview use the same display strings.
export function weightDisplay(kg, unit) {
  const text = formatWeight(kg, unit);
  const [number, label] = text.split(" ");
  return { displayValue: number, unitLabel: label };
}

export function heightDisplay(cm, unit) {
  if (unit === "ft") {
    return { displayValue: formatHeight(cm, unit), unitLabel: "ft" };
  }
  return { displayValue: String(cm), unitLabel: "cm" };
}

const styles = StyleSheet.create({
  stepBody: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  nameInput: {
    height: 72,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: DEEP_GREEN,
    backgroundColor: T.SURFACE,
    textAlign: "center",
    fontFamily: FONTS.body,
    fontSize: 17,
    color: T.TEXT,
  },
  genderRow: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 12,
  },
  genderCard: {
    flex: 1,
    height: 214,
    borderRadius: 20,
    backgroundColor: T.SURFACE,
    borderWidth: 1.5,
    borderColor: T.BORDER,
    overflow: "hidden",
  },
  genderCardSelected: {
    borderColor: DEEP_GREEN,
    borderWidth: 2,
    backgroundColor: T.PRIMARY_LIGHT,
  },
  genderImage: {
    flex: 1,
    width: "100%",
  },
  genderCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    overflow: "hidden",
  },
  genderLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: FONTS.body,
    fontSize: 14,
    color: T.TEXT,
    marginTop: 8,
  },
  preferNotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  preferNotText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: T.MUTED,
  },
  preferNotTextSelected: {
    color: DEEP_GREEN,
    fontWeight: "700",
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ageChevron: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ageChevronDisabled: {
    opacity: 0.3,
  },
  ageRulerWrap: {
    flex: 1,
  },
  ageUnit: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: T.MUTED,
    textAlign: "center",
    marginTop: 8,
  },
  pointerWrap: {
    alignItems: "center",
    marginTop: 14,
  },
  measureValue: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.SURFACE,
    borderWidth: 1.5,
    borderColor: T.BORDER,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  optionRowSelected: {
    borderColor: DEEP_GREEN,
    borderWidth: 2,
    backgroundColor: T.PRIMARY_LIGHT,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: "500",
    color: T.TEXT,
  },
  journeyRow: {
    minHeight: 91,
  },
  journeyText: {
    flex: 1,
    gap: 4,
  },
  journeyTitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    fontWeight: "600",
    color: T.TEXT,
  },
  journeyDescription: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
    color: T.MUTED,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginVertical: 20,
  },
  targetBoxWrap: {
    alignItems: "center",
    gap: 8,
  },
  targetCaption: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.MUTED,
  },
});
