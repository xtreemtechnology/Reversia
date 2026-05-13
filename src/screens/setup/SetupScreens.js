import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
  TextInput,
  Image,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AnimatedScreen from "../../components/AnimatedScreen";
import { ActivityIndicator } from "react-native";
import { auth, db } from "../../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useTheme } from "../../theme/ThemeProvider";

const { width } = Dimensions.get("window");

function useSetupLayoutFlags() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompactScreen = windowHeight < 760;
  const isNarrowScreen = windowWidth < 390;
  const isLandscape = windowWidth > windowHeight;
  const isCompactLayout =
    isCompactScreen || isNarrowScreen || (isLandscape && windowHeight < 430);
  return { isCompactLayout };
}

function useSetupStyles() {
  const { colors } = useTheme();
  return useMemo(() => getStyles(colors), [colors]);
}

// --- Small helper components used by the new screens ---
function PurpleButton({ label, onPress }) {
  const styles = useSetupStyles();
  const { isCompactLayout } = useSetupLayoutFlags();
  return (
    <TouchableOpacity
      style={[
        styles.continueBtn,
        isCompactLayout && styles.continueBtnCompact,
        { alignSelf: "stretch", marginTop: 12 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.continueBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function OptionCard({ label, selected, onPress }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const { isCompactLayout } = useSetupLayoutFlags();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.optionCard,
        isCompactLayout && styles.optionCardCompact,
        selected && styles.optionCardActive,
      ]}
    >
      <Text
        style={[
          styles.optionLabel,
          isCompactLayout && styles.optionLabelCompact,
          selected && styles.optionLabelActive,
        ]}
      >
        {label}
      </Text>
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={isCompactLayout ? 18 : 20}
          color={colors.primary}
        />
      )}
    </TouchableOpacity>
  );
}

function Pill({ children, active, onPress }) {
  const styles = useSetupStyles();
  const { isCompactLayout } = useSetupLayoutFlags();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        isCompactLayout && styles.pillCompact,
        active && styles.pillActive,
      ]}
    >
      <Text
        style={[
          styles.pillText,
          isCompactLayout && styles.pillTextCompact,
          active && styles.pillTextActive,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function InputField({ icon, placeholder, value, onChangeText }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const { isCompactLayout } = useSetupLayoutFlags();
  return (
    <View style={[styles.inputRow, isCompactLayout && styles.inputRowCompact]}>
      <Text style={styles.inputIcon}>{icon}</Text>
      <TextInput
        style={[
          styles.modernInput,
          isCompactLayout && styles.modernInputCompact,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

// ─── Reusable Step Layout ─────────────────────────────────────────────────────
function StepFrame({
  go,
  step,
  total = 7,
  title,
  subtitle,
  prev,
  next,
  children,
  onContinue,
}) {
  const insets = useSafeAreaInsets();
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const { isCompactLayout } = useSetupLayoutFlags();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => go && go(prev)}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Text style={styles.stepCounterText}>
              <Text style={{ color: colors.primary }}>{step}</Text> / {total}
            </Text>
          </View>
          <TouchableOpacity style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.mainTitle,
              isCompactLayout && styles.mainTitleCompact,
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.mainSubtitle,
              isCompactLayout && styles.mainSubtitleCompact,
            ]}
          >
            {subtitle}
          </Text>

          <View style={styles.childrenContainer}>{children}</View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              isCompactLayout && styles.continueBtnCompact,
            ]}
            onPress={() => {
              if (onContinue) {
                const canContinue = onContinue();
                if (!canContinue) return;
              }
              go && go(next);
            }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={styles.continueBtnText.color}
            />
          </TouchableOpacity>
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

// ─── Modern Selection Components ──────────────────────────────────────────────
const CountryCard = ({ label, icon, selected, onPress }) => {
  const styles = useSetupStyles();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.selCard, selected && styles.selCardActive]}
    >
      <View style={[styles.selIconBox, selected && styles.selIconBoxActive]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={styles.selLabel}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

// ─── Setup Screens ────────────────────────────────────────────────────────────

export function SetupCountry({ go, setupData, setSetupData }) {
  const regions = [
    { id: "NG", name: "Nigeria", flag: "🇳🇬" },
    { id: "UK", name: "United Kingdom", flag: "🇬🇧" },
    { id: "US", name: "United States", flag: "🇺🇸" },
    { id: "GH", name: "Ghana", flag: "🇬🇭" },
  ];

  return (
    <StepFrame
      go={go}
      step={1}
      title="Where are you?"
      subtitle="We use this to curate local dishes and nutritional data."
      prev="setupIntro"
      next="setupName"
      onContinue={() => {
        if (!setupData?.region) {
          Alert.alert("Missing information", "Please choose your region.");
          return false;
        }
        return true;
      }}
    >
      {regions.map((r) => (
        <CountryCard
          key={r.id}
          label={r.name}
          icon={r.flag}
          selected={setupData?.region === r.id}
          onPress={() => setSetupData((prev) => ({ ...prev, region: r.id }))}
        />
      ))}
    </StepFrame>
  );
}

export function SetupName({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  return (
    <StepFrame
      go={go}
      step={2}
      title="The Basics"
      subtitle="How should we address you in your health journey?"
      prev="setupCountry"
      next="setupGender"
      onContinue={() => {
        if (!setupData?.name?.trim()) {
          Alert.alert("Missing information", "Please enter your name.");
          return false;
        }
        return true;
      }}
    >
      <Text style={styles.inputLabel}>Full Name</Text>
      <TextInput
        style={styles.modernInput}
        placeholder="e.g. Daniel Nwachukwu"
        placeholderTextColor={colors.muted}
        value={setupData?.name}
        onChangeText={(val) => setSetupData((prev) => ({ ...prev, name: val }))}
      />
    </StepFrame>
  );
}

export function SetupGender({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  return (
    <StepFrame
      go={go}
      step={3}
      title="What is your gender?"
      subtitle="Please give some true answers for following question"
      prev="setupName"
      next="setupAge"
      onContinue={() => {
        if (!setupData?.gender) {
          Alert.alert("Missing information", "Please choose your gender.");
          return false;
        }
        return true;
      }}
    >
      <View style={styles.genderGrid}>
        {[
          { label: "Male", img: require("../../../assets/Male.png") },
          { label: "Female", img: require("../../../assets/Female.png") },
        ].map((g) => (
          <TouchableOpacity
            key={g.label}
            onPress={() =>
              setSetupData((prev) => ({ ...prev, gender: g.label }))
            }
            style={[
              styles.genderCard,
              setupData?.gender === g.label && styles.genderCardActive,
            ]}
          >
            <Image source={g.img} style={styles.genderIllustration} />
            <Text
              style={[
                styles.genderLabel,
                setupData?.gender === g.label && styles.genderLabelActive,
              ]}
            >
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </StepFrame>
  );
}

export function SetupAge({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const ages = Array.from({ length: 83 }, (_, i) => i + 12); // 12 to 94
  const currentAge = setupData?.age || 27;
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentAge.toString());

  const handleAgeScroll = (event) => {
    if (editing) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / 60);
    const newAge = ages[Math.min(index, ages.length - 1)];
    if (newAge) {
      setSetupData((prev) => ({ ...prev, age: newAge }));
    }
  };

  const handleEditConfirm = () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value < 12 || value > 94) {
      Alert.alert("Invalid", "Age must be between 12-94");
      setInputValue(currentAge.toString());
      return;
    }
    setSetupData((prev) => ({ ...prev, age: value }));
    setEditing(false);
  };

  return (
    <StepFrame
      go={go}
      step={4}
      title="How old are you?"
      subtitle="Scroll the ruler to select your age"
      prev="setupGender"
      next="setupWeight"
    >
      {/* Caret Indicator - Hidden when editing */}
      {!editing && (
        <View style={styles.caretContainer}>
          <Ionicons name="caret-down" size={24} color={colors.primary} />
        </View>
      )}

      {/* Value Display Box - Inline Editing */}
      <TouchableOpacity
        style={styles.valueBox}
        onPress={() => {
          setInputValue(currentAge.toString());
          setEditing(true);
        }}
        disabled={editing}
      >
        {editing ? (
          <TextInput
            style={styles.valueBoxInput}
            placeholder="Age"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
            onBlur={handleEditConfirm}
            onSubmitEditing={handleEditConfirm}
            autoFocus
            maxLength={3}
            underlineColorAndroid="transparent"
          />
        ) : (
          <Text style={styles.valueBoxText}>{currentAge}</Text>
        )}
      </TouchableOpacity>

      {/* Scrollable Ruler */}
      <FlatList
        horizontal
        data={ages}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => {
          const isHighlighted = currentAge === item;
          return (
            <View style={styles.rulerItem}>
              <View
                style={[
                  styles.rulerTick,
                  item % 10 === 0
                    ? styles.rulerTickLong
                    : styles.rulerTickShort,
                  isHighlighted && styles.rulerTickHighlighted,
                ]}
              />
              {item % 5 === 0 && (
                <Text
                  style={[
                    styles.rulerLabel,
                    isHighlighted && styles.rulerLabelHighlighted,
                  ]}
                >
                  {item}
                </Text>
              )}
            </View>
          );
        }}
        scrollEventThrottle={16}
        onScroll={handleAgeScroll}
        snapToInterval={60}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: width / 2 - 30,
        }}
        style={styles.rulerScroll}
      />
    </StepFrame>
  );
}

export function SetupWeight({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const unit = setupData?.weightUnit || "kg";
  const currentWeight = setupData?.weight || 45;
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentWeight.toString());

  // Different ranges for kg vs lb
  const weights =
    unit === "kg"
      ? Array.from({ length: 100 }, (_, i) => i + 30) // 30-129 kg
      : Array.from({ length: 140 }, (_, i) => i + 66); // 66-205 lb

  const handleWeightScroll = (event) => {
    if (editing) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / 60);
    const newWeight = weights[Math.min(index, weights.length - 1)];
    if (newWeight) {
      setSetupData((prev) => ({ ...prev, weight: newWeight }));
    }
  };

  const handleEditConfirm = () => {
    const value = parseInt(inputValue);
    const min = unit === "kg" ? 30 : 66;
    const max = unit === "kg" ? 129 : 205;
    if (isNaN(value) || value < min || value > max) {
      Alert.alert("Invalid", `Weight must be between ${min}-${max} ${unit}`);
      setInputValue(currentWeight.toString());
      return;
    }
    setSetupData((prev) => ({ ...prev, weight: value }));
    setEditing(false);
  };

  return (
    <StepFrame
      go={go}
      step={5}
      title="What is your weight?"
      subtitle="Scroll the ruler to select your weight"
      prev="setupAge"
      next="setupHeight"
    >
      <View style={styles.unitToggleRow}>
        <TouchableOpacity
          style={[
            styles.unitToggleBtn,
            unit === "lb" && styles.unitToggleBtnActive,
          ]}
          onPress={() =>
            setSetupData((prev) => ({ ...prev, weightUnit: "lb" }))
          }
        >
          <Text
            style={{
              color: unit === "lb" ? colors.background : colors.text,
              fontWeight: "700",
            }}
          >
            lb
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.unitToggleBtn,
            unit === "kg" && styles.unitToggleBtnActive,
          ]}
          onPress={() =>
            setSetupData((prev) => ({ ...prev, weightUnit: "kg" }))
          }
        >
          <Text
            style={{
              color: unit === "kg" ? colors.background : colors.text,
              fontWeight: "700",
            }}
          >
            kg
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caret Indicator - Hidden when editing */}
      {!editing && (
        <View style={styles.caretContainer}>
          <Ionicons name="caret-down" size={24} color={colors.primary} />
        </View>
      )}

      {/* Value Display Box - Inline Editing */}
      <TouchableOpacity
        style={styles.valueBox}
        onPress={() => {
          setInputValue(currentWeight.toString());
          setEditing(true);
        }}
        disabled={editing}
      >
        {editing ? (
          <TextInput
            style={styles.valueBoxInput}
            placeholder="Weight"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
            onBlur={handleEditConfirm}
            onSubmitEditing={handleEditConfirm}
            autoFocus
            maxLength={3}
            underlineColorAndroid="transparent"
          />
        ) : (
          <Text style={styles.valueBoxText}>{currentWeight}</Text>
        )}
      </TouchableOpacity>

      {/* Scrollable Ruler */}
      <FlatList
        horizontal
        data={weights}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => {
          const isHighlighted = currentWeight === item;
          return (
            <View style={styles.rulerItem}>
              <View
                style={[
                  styles.rulerTick,
                  item % 10 === 0
                    ? styles.rulerTickLong
                    : styles.rulerTickShort,
                  isHighlighted && styles.rulerTickHighlighted,
                ]}
              />
              {item % 5 === 0 && (
                <Text
                  style={[
                    styles.rulerLabel,
                    isHighlighted && styles.rulerLabelHighlighted,
                  ]}
                >
                  {item}
                </Text>
              )}
            </View>
          );
        }}
        scrollEventThrottle={16}
        onScroll={handleWeightScroll}
        snapToInterval={60}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: width / 2 - 30,
        }}
        style={styles.rulerScroll}
      />
    </StepFrame>
  );
}

export function SetupHeight({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const unit = setupData?.heightUnit || "cm";
  const currentHeight = setupData?.height || 175;
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    unit === "ft" ? currentHeight.toFixed(1) : currentHeight.toString()
  );

  // Different ranges for cm vs ft
  const heights =
    unit === "cm"
      ? Array.from({ length: 120 }, (_, i) => i + 100) // 100-219 cm
      : Array.from({ length: 36 }, (_, i) => (i + 32) / 10); // 3.2-6.8 ft

  const handleHeightScroll = (event) => {
    if (editing) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / 60);
    const newHeight = heights[Math.min(index, heights.length - 1)];
    if (newHeight) {
      setSetupData((prev) => ({ ...prev, height: newHeight }));
    }
  };

  const handleEditConfirm = () => {
    const value = unit === "ft" ? parseFloat(inputValue) : parseInt(inputValue);
    if (unit === "cm") {
      if (isNaN(value) || value < 100 || value > 219) {
        Alert.alert("Invalid", "Height must be between 100-219 cm");
        setInputValue(currentHeight.toString());
        return;
      }
    } else {
      if (isNaN(value) || value < 3.2 || value > 6.8) {
        Alert.alert("Invalid", "Height must be between 3.2-6.8 ft");
        setInputValue(currentHeight.toFixed(1));
        return;
      }
    }
    setSetupData((prev) => ({ ...prev, height: value }));
    setEditing(false);
  };

  return (
    <StepFrame
      go={go}
      step={6}
      title="What is your height?"
      subtitle="Scroll the ruler to select your height"
      prev="setupWeight"
      next="diab0"
    >
      <View style={styles.unitToggleRow}>
        <TouchableOpacity
          style={[
            styles.unitToggleBtn,
            unit === "ft" && styles.unitToggleBtnActive,
          ]}
          onPress={() =>
            setSetupData((prev) => ({ ...prev, heightUnit: "ft" }))
          }
        >
          <Text
            style={{
              color: unit === "ft" ? colors.background : colors.text,
              fontWeight: "700",
            }}
          >
            ft
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.unitToggleBtn,
            unit === "cm" && styles.unitToggleBtnActive,
          ]}
          onPress={() =>
            setSetupData((prev) => ({ ...prev, heightUnit: "cm" }))
          }
        >
          <Text
            style={{
              color: unit === "cm" ? colors.background : colors.text,
              fontWeight: "700",
            }}
          >
            cm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caret Indicator - Hidden when editing */}
      {!editing && (
        <View style={styles.caretContainer}>
          <Ionicons name="caret-down" size={24} color={colors.primary} />
        </View>
      )}

      {/* Value Display Box - Inline Editing */}
      <TouchableOpacity
        style={styles.valueBox}
        onPress={() => {
          setInputValue(
            unit === "ft" ? currentHeight.toFixed(1) : currentHeight.toString()
          );
          setEditing(true);
        }}
        disabled={editing}
      >
        {editing ? (
          <TextInput
            style={styles.valueBoxInput}
            placeholder="Height"
            placeholderTextColor={colors.muted}
            keyboardType={unit === "ft" ? "decimal-pad" : "numeric"}
            value={inputValue}
            onChangeText={setInputValue}
            onBlur={handleEditConfirm}
            onSubmitEditing={handleEditConfirm}
            autoFocus
            maxLength={unit === "ft" ? 4 : 3}
            underlineColorAndroid="transparent"
          />
        ) : (
          <Text style={styles.valueBoxText}>
            {unit === "ft" ? currentHeight.toFixed(1) : currentHeight}
          </Text>
        )}
      </TouchableOpacity>

      {/* Scrollable Ruler */}
      <FlatList
        horizontal
        data={heights}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isHighlighted = Math.abs(currentHeight - item) < 0.1;
          const displayValue = unit === "ft" ? item.toFixed(1) : item;
          return (
            <View style={styles.rulerItem}>
              <View
                style={[
                  styles.rulerTick,
                  (unit === "ft" ? item % 0.5 === 0 : item % 10 === 0)
                    ? styles.rulerTickLong
                    : styles.rulerTickShort,
                  isHighlighted && styles.rulerTickHighlighted,
                ]}
              />
              {(unit === "ft" ? item % 0.2 === 0 : item % 5 === 0) && (
                <Text
                  style={[
                    styles.rulerLabel,
                    isHighlighted && styles.rulerLabelHighlighted,
                  ]}
                >
                  {displayValue}
                </Text>
              )}
            </View>
          );
        }}
        scrollEventThrottle={16}
        onScroll={handleHeightScroll}
        snapToInterval={60}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: width / 2 - 30,
        }}
        style={styles.rulerScroll}
      />
    </StepFrame>
  );
}

// --- New Diabetes + Extra Setup Screens ---
export function DiabetesIntro({ go }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const { isCompactLayout } = useSetupLayoutFlags();
  return (
    <StepFrame
      go={go}
      step={7}
      title="Tell us about your health"
      subtitle="This helps tailor glucose targets, reminders, and food recommendations."
      prev="setupHeight"
      next="diab1"
    >
      <View
        style={[
          styles.healthIntroCard,
          isCompactLayout && styles.healthIntroCardCompact,
        ]}
      >
        <View
          style={[
            styles.healthIntroIconWrap,
            isCompactLayout && styles.healthIntroIconWrapCompact,
          ]}
        >
          <Text style={{ fontSize: 46 }}>🩺</Text>
        </View>
        <Text
          style={[
            styles.centerTitle,
            isCompactLayout && styles.centerTitleCompact,
          ]}
        >
          Health profile
        </Text>
        <Text
          style={[
            styles.centerText,
            isCompactLayout && styles.centerTextCompact,
          ]}
        >
          We'll personalize glucose reminders, meal guidance, and daily insights
          based on your answers.
        </Text>
        <View style={styles.healthIntroMetaRow}>
          <View style={styles.healthMetaPill}>
            <Ionicons name="analytics" size={14} color={colors.primary} />
            <Text style={styles.healthMetaText}>Smart targets</Text>
          </View>
          <View style={styles.healthMetaPill}>
            <Ionicons name="notifications" size={14} color={colors.primary} />
            <Text style={styles.healthMetaText}>Better reminders</Text>
          </View>
        </View>
      </View>
    </StepFrame>
  );
}

export function Diabetes1({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const options = ["Type 1 Diabetes", "Type 2 Diabetes", "Prediabetes"];
  return (
    <StepFrame
      go={go}
      step={1}
      total={3}
      title="What is your health condition?"
      subtitle="Choose the option that best describes you"
      prev="diab0"
      next="diab2"
    >
      <View style={styles.sectionCard}>
        <View style={styles.inlineHint}>
          <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
          <Text style={styles.inlineHintText}>
            Used only to personalize your recommendations
          </Text>
        </View>
        <View style={styles.optionStack}>
          {options.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              selected={setupData?.diabetesType === opt}
              onPress={() =>
                setSetupData((p = {}) => ({ ...p, diabetesType: opt }))
              }
            />
          ))}
        </View>
      </View>
    </StepFrame>
  );
}

export function Diabetes2({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const meds = ["On insulin", "Oral medication", "No medication"];
  const durations = [
    "Just found out",
    "Less than 1 year",
    "1-3 years",
    "3-5 years",
    "5+ years",
    "Not diagnosed",
  ];
  return (
    <StepFrame
      go={go}
      step={2}
      total={3}
      title="A bit more about you"
      subtitle="Medication and diagnosis history"
      prev="diab1"
      next="diab3"
    >
      <View style={styles.sectionCard}>
        <Text style={styles.groupTitle}>Medication / Insulin</Text>
        <View style={styles.optionStack}>
          {meds.map((m) => (
            <OptionCard
              key={m}
              label={m}
              selected={setupData?.onMedication === m}
              onPress={() =>
                setSetupData((p = {}) => ({ ...p, onMedication: m }))
              }
            />
          ))}
        </View>

        <View style={styles.sectionDivider} />

        <Text style={styles.groupTitle}>How long diagnosed?</Text>
        <View style={styles.chipWrap}>
          {durations.map((d) => (
            <Pill
              key={d}
              active={setupData?.diagnosedDuration === d}
              onPress={() =>
                setSetupData((p = {}) => ({ ...p, diagnosedDuration: d }))
              }
            >
              {d}
            </Pill>
          ))}
        </View>
      </View>
    </StepFrame>
  );
}

export function Diabetes3({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const frequencies = ["Daily", "Weekly", "Rarely", "Never"];
  return (
    <StepFrame
      go={go}
      step={3}
      total={3}
      title="Do you check your blood sugar?"
      subtitle="We use this to set the right reminders"
      prev="diab2"
      next="setup8"
    >
      <View style={styles.sectionCard}>
        <View style={styles.inlineHint}>
          <Ionicons name="time" size={14} color={colors.primary} />
          <Text style={styles.inlineHintText}>
            This helps us choose reminder intensity
          </Text>
        </View>
        <View style={styles.optionStack}>
          {frequencies.map((f) => (
            <OptionCard
              key={f}
              label={f}
              selected={setupData?.checkFrequency === f}
              onPress={() =>
                setSetupData((p = {}) => ({ ...p, checkFrequency: f }))
              }
            />
          ))}
        </View>
      </View>
    </StepFrame>
  );
}

export function Setup8({ go, setupData, setSetupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const levels = [
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
  ];
  return (
    <StepFrame
      go={go}
      step={8}
      total={8}
      title="How active is your daily life?"
      subtitle="This helps calculate your needs"
      prev="diab3"
      next="setupgen"
    >
      <View style={styles.sectionCard}>
        <View style={styles.inlineHint}>
          <Ionicons name="walk" size={14} color={colors.primary} />
          <Text style={styles.inlineHintText}>
            Selecting activity level moves to next step automatically
          </Text>
        </View>
        <View style={styles.optionStack}>
          {levels.map((level) => (
            <OptionCard
              key={level}
              label={level}
              selected={setupData?.level === level}
              onPress={() => {
                setSetupData((p = {}) => ({ ...p, level }));
                // auto-advance to generating once user selects activity
                setTimeout(() => go("setupgen"), 350);
              }}
            />
          ))}
        </View>

        <View style={styles.sectionDivider} />

        <Text style={styles.groupTitle}>Preferred Glucose Unit</Text>
        <View style={styles.chipWrap}>
          {["mg/dL", "mmol/L"].map((unit) => (
            <Pill
              key={unit}
              active={setupData?.glucoseUnit === unit}
              onPress={() =>
                setSetupData((p = {}) => ({ ...p, glucoseUnit: unit }))
              }
            >
              {unit}
            </Pill>
          ))}
        </View>

        <Text style={styles.groupTitle}>Emergency Contact (Optional)</Text>
        <InputField
          icon="👥"
          placeholder="Emergency contact name"
          value={setupData?.emergencyContactName}
          onChangeText={(emergencyContactName) =>
            setSetupData((p = {}) => ({ ...p, emergencyContactName }))
          }
        />
        <InputField
          icon="☎"
          placeholder="Caregiver phone"
          value={setupData?.caregiverPhone}
          onChangeText={(caregiverPhone) =>
            setSetupData((p = {}) => ({ ...p, caregiverPhone }))
          }
        />
      </View>
    </StepFrame>
  );
}

export function SetupGenerating({ go }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const { isCompactLayout } = useSetupLayoutFlags();
  // try to use a Lottie animation if available at assets/animations/setup-generating.json
  // Avoid Metro statically resolving `lottie-react-native` on web by gating and using
  // an eval-based require so web builds don't pull native-only dependencies.
  let LottieView = null;
  if (Platform.OS !== "web") {
    try {
      // use eval to prevent static analysis by Metro
      // eslint-disable-next-line no-eval
      const pkg = eval("require")("lottie-react-native");
      LottieView = pkg?.default || pkg;
    } catch (e) {
      LottieView = null;
    }
  }
  const remoteLottie = {
    uri: "https://assets10.lottiefiles.com/packages/lf20_touohxv0.json",
  };

  // auto-advance to the completion screen after a short delay
  useEffect(() => {
    const t = setTimeout(() => {
      go && go("setupgenComplete");
    }, 1600);
    return () => clearTimeout(t);
  }, [go]);

  return (
    <AnimatedScreen>
      <View style={styles.rootCenter}>
        {/* Decorative hero built with code instead of an image */}
        <View
          style={[
            styles.heroCircle,
            isCompactLayout && styles.heroCircleCompact,
          ]}
        >
          <View
            style={[
              styles.heroInnerCircle,
              isCompactLayout && styles.heroInnerCircleCompact,
            ]}
          >
            <Ionicons name="sparkles" size={46} color={colors.background} />
          </View>
        </View>

        {LottieView ? (
          <View
            style={[
              styles.generatingLottieWrap,
              isCompactLayout && styles.generatingLottieWrapCompact,
            ]}
          >
            {/** prefer local asset if present, otherwise use remote URI */}
            {(() => {
              try {
                // try local asset first
                const local = require("../../../assets/animations/setup-generating.json");
                return <LottieView source={local} autoPlay loop />;
              } catch (e) {
                return <LottieView source={remoteLottie} autoPlay loop />;
              }
            })()}
          </View>
        ) : (
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={[styles.pulseDot, { marginRight: 10 }]} />
              <View
                style={[
                  styles.pulseDot,
                  { marginRight: 10, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        )}

        <Text
          style={[
            styles.centerTitle,
            styles.generatingTitle,
            isCompactLayout && styles.centerTitleCompact,
          ]}
        >
          Generating your plan
        </Text>
        <Text
          style={[
            styles.centerText,
            styles.generatingSubtext,
            isCompactLayout && styles.centerTextCompact,
          ]}
        >
          Personalizing meals, reminders and insights just for you.
        </Text>
      </View>
    </AnimatedScreen>
  );
}

const splitFullName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

const buildSetupProfile = (setupData = {}) => {
  const { firstName, lastName } = splitFullName(setupData.name || "");

  return {
    firstName,
    lastName,
    fullName: setupData.name || "",
    region: setupData.region || "",
    gender: setupData.gender || "",
    age: setupData.age ?? null,
    currentWeight: setupData.weight ?? null,
    weightUnit: setupData.weightUnit || "kg",
    height: setupData.height ?? null,
    heightUnit: setupData.heightUnit || "cm",
    diabetesType: setupData.diabetesType || "",
    healthStatus: setupData.diabetesType || "",
    onMedication: setupData.onMedication || "",
    diagnosedDuration: setupData.diagnosedDuration || "",
    checkFrequency: setupData.checkFrequency || "",
    level: setupData.level || "",
    glucoseUnit: setupData.glucoseUnit || "",
    emergencyContactName: setupData.emergencyContactName || "",
    caregiverPhone: setupData.caregiverPhone || "",
    readinessLevel: setupData.readinessLevel || "",
    onboardingStep: 8,
    isOnboardingComplete: true,
    updatedAt: new Date().toISOString(),
  };
};

export function SetupGeneratingComplete({ go, setupData }) {
  const styles = useSetupStyles();
  const { colors } = useTheme();
  const { isCompactLayout } = useSetupLayoutFlags();
  const [error, setError] = React.useState(null);

  const handleStartJourney = async () => {
    setError(null);
    const user = auth.currentUser;
    if (!user) {
      go && go("Login");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), buildSetupProfile(setupData), {
        merge: true,
      });
      go && go("MainApp");
    } catch (err) {
      console.error("Error saving setup profile:", err);
      setError(
        "Failed to save your profile. Please check your connection and try again."
      );
    }
  };

  return (
    <AnimatedScreen>
      <View style={styles.rootCenter}>
        <View
          style={[
            styles.completeBadgeOuter,
            isCompactLayout && styles.completeBadgeOuterCompact,
          ]}
        >
          <View
            style={[
              styles.completeBadge,
              isCompactLayout && styles.completeBadgeCompact,
            ]}
          >
            <Ionicons
              name={error ? "alert-circle" : "checkmark"}
              size={58}
              color={error ? "#EF4444" : colors.background}
            />
          </View>
        </View>
        <Text
          style={[
            styles.centerTitle,
            styles.completeTitle,
            isCompactLayout && styles.centerTitleCompact,
          ]}
        >
          {error ? "Unable to Continue" : "All Set!"}
        </Text>
        <Text
          style={[
            styles.centerText,
            styles.completeSubtext,
            isCompactLayout && styles.centerTextCompact,
          ]}
        >
          {error
            ? error
            : "Your plan is ready. Let's begin your Reversia journey."}
        </Text>
        {error && (
          <Text
            style={[
              styles.centerText,
              { color: colors.muted, marginBottom: 20, fontSize: 12 },
            ]}
          >
            Tap "Try Again" to retry.
          </Text>
        )}
        <View
          style={[
            styles.completeButtonWrap,
            isCompactLayout && styles.completeButtonWrapCompact,
          ]}
        >
          <PurpleButton
            label={error ? "Try Again" : "Start Journey"}
            onPress={handleStartJourney}
          />
        </View>
      </View>
    </AnimatedScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header & Navigation
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      height: 80,
    },
    backBtn: { width: 40 },
    progressContainer: { flex: 1, alignItems: "center" },
    stepCounterText: { fontSize: 16, fontWeight: "700", color: colors.muted },
    skipBtn: {
      backgroundColor: colors.card,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skipText: { color: colors.muted, fontWeight: "600" },

    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 120,
    },
    mainTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 10,
    },
    mainSubtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      marginBottom: 40,
      lineHeight: 22,
    },
    mainTitleCompact: {
      fontSize: 28,
    },
    mainSubtitleCompact: {
      fontSize: 14,
      marginBottom: 28,
      lineHeight: 20,
    },

    horizontalPicker: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 15,
      marginTop: 40,
    },
    ageNode: { padding: 10 },
    ageNodeActive: {
      backgroundColor: `${colors.primary}15`,
      borderRadius: 20,
      width: 80,
      height: 80,
      justifyContent: "center",
      alignItems: "center",
    },
    ageText: { fontSize: 24, color: colors.muted, fontWeight: "600" },
    ageTextActive: { color: colors.primary, fontSize: 40, fontWeight: "800" },

    unitToggleRow: {
      flexDirection: "row",
      alignSelf: "center",
      backgroundColor: colors.card,
      borderRadius: 25,
      padding: 5,
      marginBottom: 30,
    },
    unitToggleBtn: {
      paddingHorizontal: 35,
      paddingVertical: 12,
      borderRadius: 22,
    },
    unitToggleBtnActive: { backgroundColor: colors.primary },

    caretContainer: {
      alignItems: "center",
      marginBottom: -12,
      zIndex: 10,
    },

    valueBox: {
      backgroundColor: colors.card,
      paddingHorizontal: 50,
      paddingVertical: 20,
      borderRadius: 25,
      alignSelf: "center",
      marginVertical: 25,
      minWidth: 120,
    },
    valueBoxText: {
      fontSize: 48,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
    },

    rulerScroll: {
      height: 80,
    },
    rulerItem: {
      width: 60,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: 5,
    },
    rulerTick: {
      width: 2,
      backgroundColor: colors.border,
    },
    rulerTickShort: {
      height: 20,
    },
    rulerTickLong: {
      height: 40,
      backgroundColor: colors.primary,
    },
    rulerTickHighlighted: {
      width: 3,
      backgroundColor: colors.primary,
    },
    rulerLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      marginTop: 8,
    },
    rulerLabelHighlighted: {
      color: colors.primary,
      fontWeight: "900",
      fontSize: 13,
    },

    rulerContainer: { alignItems: "center", marginTop: 20 },
    metricDisplayBox: {
      backgroundColor: colors.card,
      paddingHorizontal: 50,
      paddingVertical: 25,
      borderRadius: 25,
      marginBottom: 30,
    },
    metricDisplayText: {
      fontSize: 52,
      fontWeight: "800",
      color: colors.primary,
    },

    // Gender Cards
    genderGrid: { flexDirection: "row", gap: 15 },
    genderCard: {
      flex: 1,
      borderRadius: 24,
      backgroundColor: colors.card,
      padding: 12,
      alignItems: "center",
    },
    genderCardActive: { backgroundColor: colors.primary },
    genderIllustration: {
      width: "100%",
      height: 200,
      borderRadius: 20,
      marginBottom: 10,
    },
    genderLabel: { fontWeight: "700", color: colors.muted, fontSize: 16 },
    genderLabelActive: { color: colors.background },

    // Country Selection Cards
    selCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: 18,
      borderRadius: 24,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    selCardActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    selIconBox: {
      width: 52,
      height: 52,
      borderRadius: 18,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    selIconBoxActive: { backgroundColor: colors.card },
    selLabel: { flex: 1, fontSize: 17, fontWeight: "700", color: colors.text },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    radioActive: { borderColor: colors.primary },
    radioInner: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.primary,
    },

    // Input
    inputLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
      marginLeft: 4,
    },
    modernInput: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 20,
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Footer
    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      paddingHorizontal: 24,
      backgroundColor: "transparent",
    },
    continueBtn: {
      backgroundColor: colors.primary,
      height: 65,
      borderRadius: 35,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    continueBtnCompact: {
      height: 58,
      borderRadius: 30,
    },
    continueBtnText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: "700",
    },

    childrenContainer: { marginTop: 20 },

    // Diabetes and post-height setup styles
    healthIntroCard: {
      backgroundColor: colors.card,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      alignItems: "center",
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 18,
      elevation: 2,
    },
    healthIntroCardCompact: {
      padding: 16,
      borderRadius: 20,
    },
    healthIntroIconWrap: {
      width: 94,
      height: 94,
      borderRadius: 47,
      backgroundColor: `${colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    healthIntroIconWrapCompact: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 8,
    },
    healthIntroMetaRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 16,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    healthMetaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    healthMetaText: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 12,
    },
    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 58,
      paddingHorizontal: 16,
      marginBottom: 10,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    optionCardCompact: {
      minHeight: 52,
      paddingHorizontal: 14,
      borderRadius: 14,
      marginBottom: 8,
    },
    optionStack: {
      marginTop: 4,
    },
    optionCardActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    optionLabel: {
      flex: 1,
      color: colors.text,
      fontWeight: "700",
      fontSize: 15,
    },
    optionLabelCompact: {
      fontSize: 14,
    },
    optionLabelActive: {
      color: colors.primary,
    },
    groupTitle: {
      marginTop: 14,
      marginBottom: 10,
      color: colors.text,
      fontWeight: "800",
      fontSize: 14,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inlineHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 10,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    inlineHintText: {
      color: colors.muted,
      fontSize: 12.5,
      fontWeight: "600",
      flex: 1,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    chipWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    pillCompact: {
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    pillActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}15`,
    },
    pillText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    pillTextCompact: {
      fontSize: 12,
    },
    pillTextActive: {
      color: colors.primary,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 12,
      marginBottom: 10,
    },
    inputRowCompact: {
      borderRadius: 14,
      paddingHorizontal: 10,
      marginBottom: 8,
    },
    inputIcon: {
      fontSize: 18,
      marginRight: 10,
    },
    modernInputCompact: {
      padding: 16,
      fontSize: 14,
    },

    // Inline Edit Input
    valueBoxInput: {
      fontSize: 48,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
      padding: 0,
      borderWidth: 0,
      outlineWidth: 0,
    },
    pulseDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.primary,
    },
    rootCenter: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingHorizontal: 24,
    },
    centerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      marginTop: 12,
      textAlign: "center",
      letterSpacing: 0.2,
    },
    centerText: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      marginTop: 8,
      lineHeight: 22,
    },
    centerTitleCompact: {
      fontSize: 21,
      marginTop: 10,
    },
    centerTextCompact: {
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },
    heroCircle: {
      width: 176,
      height: 176,
      borderRadius: 88,
      backgroundColor: `${colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroCircleCompact: {
      width: 152,
      height: 152,
      borderRadius: 76,
    },
    heroInnerCircle: {
      width: 102,
      height: 102,
      borderRadius: 51,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.24,
      shadowRadius: 16,
      elevation: 6,
    },
    heroInnerCircleCompact: {
      width: 86,
      height: 86,
      borderRadius: 43,
    },
    generatingLottieWrap: {
      width: 190,
      height: 190,
      marginTop: 14,
    },
    generatingLottieWrapCompact: {
      width: 154,
      height: 154,
      marginTop: 10,
    },
    generatingTitle: {
      marginTop: 14,
    },
    generatingSubtext: {
      marginTop: 6,
      maxWidth: 290,
    },
    completeBadgeOuter: {
      width: 172,
      height: 172,
      borderRadius: 86,
      backgroundColor: `${colors.primary}15`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    completeBadgeOuterCompact: {
      width: 148,
      height: 148,
      borderRadius: 74,
    },
    completeBadge: {
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    completeBadgeCompact: {
      width: 114,
      height: 114,
      borderRadius: 57,
    },
    completeTitle: {
      marginTop: 18,
    },
    completeSubtext: {
      marginTop: 8,
      maxWidth: 300,
    },
    completeButtonWrap: {
      width: "100%",
      marginTop: 22,
    },
    completeButtonWrapCompact: {
      marginTop: 16,
    },
  });
}
