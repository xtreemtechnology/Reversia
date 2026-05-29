// screens/profile/components/ProfileEditModal.jsx

import React from "react";
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  colors,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType || "default"}
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
}

function OptionChip({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary + "22" : colors.background,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.primary : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ChipGroup({ label, options, value, onChange, multiSelect = false, colors }) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const toggleValue = (item) => {
    if (multiSelect) {
      const next = selectedValues.includes(item)
        ? selectedValues.filter((existing) => existing !== item)
        : [...selectedValues, item];
      onChange(next);
      return;
    }

    onChange(item);
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.chipsRow}>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const active = multiSelect
            ? selectedValues.includes(optionValue)
            : value === optionValue;

          return (
            <OptionChip
              key={optionValue}
              label={optionLabel}
              active={active}
              onPress={() => toggleValue(optionValue)}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function ProfileEditModal({
  visible,
  onClose,
  onSave,
  editFirst,
  setEditFirst,
  editLast,
  setEditLast,
  editPhone,
  setEditPhone,
  editStaples,
  setEditStaples,
  editSweetDrinkFrequency,
  setEditSweetDrinkFrequency,
  editDietaryRestrictions,
  setEditDietaryRestrictions,
  editPrimaryGoal,
  setEditPrimaryGoal,
  editSecondaryGoals,
  setEditSecondaryGoals,
  editSleepHours,
  setEditSleepHours,
  editSleepQuality,
  setEditSleepQuality,
  editOnMedication,
  setEditOnMedication,
  editActivityLevel,
  setEditActivityLevel,
  editWeight,
  setEditWeight,
  editTargetGlucose,
  setEditTargetGlucose,
  editEmergencyContactName,
  setEditEmergencyContactName,
  editEmergencyContactPhone,
  setEditEmergencyContactPhone,
  editPrimaryHba1c,
  setEditPrimaryHba1c,
  editFastingBloodSugar,
  setEditFastingBloodSugar,
  editFears,
  setEditFears,
}) {
  const { colors } = useTheme();

  const stapleOptions = [
    { value: "rice", label: "Rice / Jollof" },
    { value: "swallow", label: "Swallow / Garri / Eba" },
    { value: "yam", label: "Yam / Plantain" },
    { value: "beans", label: "Beans / Moi Moi" },
    { value: "bread", label: "Bread / Noodles" },
  ];

  const restrictionOptions = [
    { value: "none", label: "None" },
    { value: "seafood", label: "Seafood" },
    { value: "legumes", label: "Legumes" },
    { value: "dairy", label: "Dairy" },
    { value: "gluten", label: "Gluten" },
    { value: "other", label: "Other" },
  ];

  const goalOptions = [
    { value: "glucose", label: "Glucose" },
    { value: "energy", label: "Energy" },
    { value: "reverse", label: "Reverse" },
    { value: "learn", label: "Learn" },
  ];

  const sleepOptions = [
    { value: "less_than_5", label: "< 5h" },
    { value: "5-6", label: "5-6h" },
    { value: "6-7", label: "6-7h" },
    { value: "7-8", label: "7-8h" },
    { value: "more_than_8", label: "> 8h" },
  ];

  const sleepQualityOptions = [
    { value: "poor", label: "Poor" },
    { value: "fair", label: "Fair" },
    { value: "good", label: "Good" },
    { value: "excellent", label: "Excellent" },
  ];

  const yesNoOptions = [
    { value: true, label: "On medication" },
    { value: false, label: "Not on medication" },
  ];

  const fearOptions = [
    { value: "amputation", label: "Losing a limb" },
    { value: "blindness", label: "Going blind" },
    { value: "kidney", label: "Kidney damage" },
    { value: "meds", label: "On meds forever" },
    { value: "food", label: "Not eating favourite foods" },
    { value: "children", label: "Passing to children" },
    { value: "nothing", label: "Nothing / hopeful" },
  ];


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border + "80" }]}> 
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.title, { color: colors.foreground }]}>Edit Profile</Text>

            <Field label="First name" value={editFirst} onChangeText={setEditFirst} placeholder="First name" colors={colors} />
            <Field label="Last name" value={editLast} onChangeText={setEditLast} placeholder="Last name" colors={colors} />
            <Field label="Phone" value={editPhone} onChangeText={setEditPhone} placeholder="Phone number" keyboardType="phone-pad" colors={colors} />

            <Field label="Activity level" value={editActivityLevel} onChangeText={setEditActivityLevel} placeholder="Moderate" colors={colors} />
            <Field label="Weight (kg)" value={editWeight} onChangeText={setEditWeight} placeholder="72" keyboardType="numeric" colors={colors} />
            <Field label="Target glucose" value={editTargetGlucose} onChangeText={setEditTargetGlucose} placeholder="110" keyboardType="numeric" colors={colors} />

            <Field label="Most recent HBA1c" value={String(editPrimaryHba1c || "")} onChangeText={(t) => setEditPrimaryHba1c(t)} placeholder="e.g. 6.5" keyboardType="numeric" colors={colors} />
            <Field label="Fasting blood sugar (mg/dL)" value={String(editFastingBloodSugar || "")} onChangeText={(t) => setEditFastingBloodSugar(t)} placeholder="e.g. 110" keyboardType="numeric" colors={colors} />

            <Field label="Emergency contact name" value={editEmergencyContactName} onChangeText={setEditEmergencyContactName} placeholder="Contact name" colors={colors} />
            <Field label="Emergency contact phone" value={editEmergencyContactPhone} onChangeText={setEditEmergencyContactPhone} placeholder="Contact phone" keyboardType="phone-pad" colors={colors} />

            <ChipGroup label="Food staples" options={stapleOptions} value={editStaples} onChange={setEditStaples} multiSelect colors={colors} />
            <ChipGroup label="Sweet drink frequency" options={["daily", "weekly", "rarely", "never"]} value={editSweetDrinkFrequency} onChange={setEditSweetDrinkFrequency} colors={colors} />
            <ChipGroup label="Dietary restrictions" options={restrictionOptions} value={editDietaryRestrictions} onChange={setEditDietaryRestrictions} multiSelect colors={colors} />

            <ChipGroup label="Primary goal" options={goalOptions} value={editPrimaryGoal} onChange={setEditPrimaryGoal} colors={colors} />
            <ChipGroup label="Secondary goals" options={goalOptions} value={editSecondaryGoals} onChange={setEditSecondaryGoals} multiSelect colors={colors} />

            <ChipGroup label="Health fears" options={fearOptions} value={editFears} onChange={setEditFears} multiSelect colors={colors} />

            <ChipGroup label="Typical sleep hours" options={sleepOptions} value={editSleepHours} onChange={setEditSleepHours} colors={colors} />
            <ChipGroup label="Sleep quality" options={sleepQualityOptions} value={editSleepQuality} onChange={setEditSleepQuality} colors={colors} />

            <ChipGroup label="Medication status" options={yesNoOptions} value={editOnMedication} onChange={setEditOnMedication} colors={colors} />

            <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.cancelText, { color: colors.mutedForeground }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
    gap: 16,
    maxHeight: "92%",
    borderWidth: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans_700Bold",
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "DMSans_500Medium",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
