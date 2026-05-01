import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../../components/AnimatedScreen';
import { ActivityIndicator } from 'react-native';


const { width } = Dimensions.get('window');

// --- Small helper components used by the new screens ---
function PurpleButton({ label, onPress }) {
  return (
    <TouchableOpacity style={[styles.continueBtn, { alignSelf: 'stretch', marginTop: 12 }]} onPress={onPress}>
      <Text style={styles.continueBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function OptionCard({ label, selected, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.optionCard, selected && styles.selCardActive]}>
      <Text style={[styles.selLabel, selected && styles.selLabelActive]}>{label}</Text>
      {selected && <Ionicons name="checkmark-circle" size={20} color="#825CFF" />}
    </TouchableOpacity>
  );
}

function Pill({ children, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{children}</Text>
    </TouchableOpacity>
  );
}

function InputField({ icon, placeholder, value, onChangeText }) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputIcon}>{icon}</Text>
      <TextInput style={styles.modernInput} placeholder={placeholder} value={value} onChangeText={onChangeText} placeholderTextColor="#9CA3AF" />
    </View>
  );
}


// ─── Reusable Step Layout ─────────────────────────────────────────────────────
function StepFrame({ go, step, total = 7, title, subtitle, prev, next, children, onContinue }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => go && go(prev)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
             <Text style={styles.stepCounterText}>
               <Text style={{color: '#825CFF'}}>{step}</Text> / {total}
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
          <Text style={styles.mainTitle}>{title}</Text>
          <Text style={styles.mainSubtitle}>{subtitle}</Text>
          
          <View style={styles.childrenContainer}>
            {children}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity 
            style={styles.continueBtn} 
            onPress={() => {
              if (onContinue) {
                const canContinue = onContinue();
                if (!canContinue) return;
              }
              go && go(next);
            }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

// ─── Modern Selection Components ──────────────────────────────────────────────
const CountryCard = ({ label, icon, selected, onPress }) => (
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

// ─── Setup Screens ────────────────────────────────────────────────────────────

export function SetupCountry({ go, setupData, setSetupData }) {
  const regions = [
    { id: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { id: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'US', name: 'United States', flag: '🇺🇸' },
    { id: 'GH', name: 'Ghana', flag: '🇬🇭' },
  ];

  return (
    <StepFrame
      go={go} step={1} title="Where are you?" subtitle="We use this to curate local dishes and nutritional data."
      prev="setupIntro" next="setupName"
      onContinue={() => {
        if (!setupData?.region) {
          Alert.alert('Missing information', 'Please choose your region.');
          return false;
        }
        return true;
      }}
    >
      {regions.map((r) => (
        <CountryCard 
          key={r.id} label={r.name} icon={r.flag}
          selected={setupData?.region === r.id}
          onPress={() => setSetupData(prev => ({ ...prev, region: r.id }))}
        />
      ))}
    </StepFrame>
  );
}

export function SetupName({ go, setupData, setSetupData }) {
  return (
    <StepFrame
      go={go} step={2} title="The Basics" subtitle="How should we address you in your health journey?"
      prev="setupCountry" next="setupGender"
      onContinue={() => {
        if (!setupData?.name?.trim()) {
          Alert.alert('Missing information', 'Please enter your name.');
          return false;
        }
        return true;
      }}
    >
      <Text style={styles.inputLabel}>Full Name</Text>
      <TextInput
        style={styles.modernInput}
        placeholder="e.g. Daniel Nwachukwu"
        placeholderTextColor="#9CA3AF"
        value={setupData?.name}
        onChangeText={(val) => setSetupData(prev => ({ ...prev, name: val }))}
      />
    </StepFrame>
  );
}

export function SetupGender({ go, setupData, setSetupData }) {
  return (
    <StepFrame
      go={go} step={3} title="What is your gender?" subtitle="Please give some true answers for following question"
      prev="setupName" next="setupAge"
      onContinue={() => {
        if (!setupData?.gender) {
          Alert.alert('Missing information', 'Please choose your gender.');
          return false;
        }
        return true;
      }}
    >
      <View style={styles.genderGrid}>
        {[
          { label: 'Male', img: 'https://i.ibb.co/L8z0PzY/male-avatar.png' },
          { label: 'Female', img: 'https://i.ibb.co/mS6yP8K/female-avatar.png' }
        ].map(g => (
          <TouchableOpacity 
            key={g.label}
            onPress={() => setSetupData(prev => ({ ...prev, gender: g.label }))}
            style={[styles.genderCard, setupData?.gender === g.label && styles.genderCardActive]}
          >
            <Image source={{ uri: g.img }} style={styles.genderIllustration} />
            <Text style={[styles.genderLabel, setupData?.gender === g.label && styles.genderLabelActive]}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </StepFrame>
  );
}

export function SetupAge({ go, setupData, setSetupData }) {
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
      setSetupData(prev => ({ ...prev, age: newAge }));
    }
  };

  const handleEditConfirm = () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value < 12 || value > 94) {
      Alert.alert('Invalid', 'Age must be between 12-94');
      setInputValue(currentAge.toString());
      return;
    }
    setSetupData(prev => ({ ...prev, age: value }));
    setEditing(false);
  };

  return (
    <StepFrame
      go={go} step={4} title="How old are you?" subtitle="Scroll the ruler to select your age"
      prev="setupGender" next="setupWeight"
    >
      {/* Caret Indicator - Hidden when editing */}
      {!editing && (
      <View style={styles.caretContainer}>
        <Ionicons name="caret-down" size={24} color="#70d6ff" />
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
            placeholderTextColor="#9CA3AF"
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
              <View style={[
                styles.rulerTick,
                item % 10 === 0 ? styles.rulerTickLong : styles.rulerTickShort,
                isHighlighted && styles.rulerTickHighlighted
              ]} />
              {item % 5 === 0 && (
                <Text style={[styles.rulerLabel, isHighlighted && styles.rulerLabelHighlighted]}>
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
          paddingHorizontal: (width / 2) - 30,
        }}
        style={styles.rulerScroll}
      />
    </StepFrame>
  );
}

export function SetupWeight({ go, setupData, setSetupData }) {
  const unit = setupData?.weightUnit || 'kg';
  const currentWeight = setupData?.weight || 45;
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentWeight.toString());
  
  // Different ranges for kg vs lb
  const weights = unit === 'kg' 
    ? Array.from({ length: 100 }, (_, i) => i + 30)      // 30-129 kg
    : Array.from({ length: 140 }, (_, i) => i + 66);     // 66-205 lb

  const handleWeightScroll = (event) => {
    if (editing) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / 60);
    const newWeight = weights[Math.min(index, weights.length - 1)];
    if (newWeight) {
      setSetupData(prev => ({ ...prev, weight: newWeight }));
    }
  };

  const handleEditConfirm = () => {
    const value = parseInt(inputValue);
    const min = unit === 'kg' ? 30 : 66;
    const max = unit === 'kg' ? 129 : 205;
    if (isNaN(value) || value < min || value > max) {
      Alert.alert('Invalid', `Weight must be between ${min}-${max} ${unit}`);
      setInputValue(currentWeight.toString());
      return;
    }
    setSetupData(prev => ({ ...prev, weight: value }));
    setEditing(false);
  };

  return (
    <StepFrame
      go={go} step={5} title="What is your weight?" subtitle="Scroll the ruler to select your weight"
      prev="setupAge" next="setupHeight"
    >
      <View style={styles.unitToggleRow}>
        <TouchableOpacity 
            style={[styles.unitToggleBtn, unit === 'lb' && styles.unitToggleBtnActive]}
            onPress={() => setSetupData(prev => ({ ...prev, weightUnit: 'lb' }))}
        >
          <Text style={{color: unit === 'lb' ? '#FFF' : '#111827', fontWeight: '700'}}>lb</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.unitToggleBtn, unit === 'kg' && styles.unitToggleBtnActive]}
            onPress={() => setSetupData(prev => ({ ...prev, weightUnit: 'kg' }))}
        >
          <Text style={{color: unit === 'kg' ? '#FFF' : '#111827', fontWeight: '700'}}>kg</Text>
        </TouchableOpacity>
      </View>

      {/* Caret Indicator - Hidden when editing */}
      {!editing && (
      <View style={styles.caretContainer}>
        <Ionicons name="caret-down" size={24} color="#70d6ff" />
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
            placeholderTextColor="#9CA3AF"
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
              <View style={[
                styles.rulerTick,
                item % 10 === 0 ? styles.rulerTickLong : styles.rulerTickShort,
                isHighlighted && styles.rulerTickHighlighted
              ]} />
              {item % 5 === 0 && (
                <Text style={[styles.rulerLabel, isHighlighted && styles.rulerLabelHighlighted]}>
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
          paddingHorizontal: (width / 2) - 30,
        }}
        style={styles.rulerScroll}
      />
    </StepFrame>
  );
}

export function SetupHeight({ go, setupData, setSetupData }) {
  const unit = setupData?.heightUnit || 'cm';
  const currentHeight = setupData?.height || 175;
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(unit === 'ft' ? currentHeight.toFixed(1) : currentHeight.toString());
  
  // Different ranges for cm vs ft
  const heights = unit === 'cm'
    ? Array.from({ length: 120 }, (_, i) => i + 100)     // 100-219 cm
    : Array.from({ length: 36 }, (_, i) => (i + 32) / 10); // 3.2-6.8 ft

  const handleHeightScroll = (event) => {
    if (editing) return;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / 60);
    const newHeight = heights[Math.min(index, heights.length - 1)];
    if (newHeight) {
      setSetupData(prev => ({ ...prev, height: newHeight }));
    }
  };

  const handleEditConfirm = () => {
    const value = unit === 'ft' ? parseFloat(inputValue) : parseInt(inputValue);
    if (unit === 'cm') {
      if (isNaN(value) || value < 100 || value > 219) {
        Alert.alert('Invalid', 'Height must be between 100-219 cm');
        setInputValue(currentHeight.toString());
        return;
      }
    } else {
      if (isNaN(value) || value < 3.2 || value > 6.8) {
        Alert.alert('Invalid', 'Height must be between 3.2-6.8 ft');
        setInputValue(currentHeight.toFixed(1));
        return;
      }
    }
    setSetupData(prev => ({ ...prev, height: value }));
    setEditing(false);
  };

  return (
    <StepFrame
      go={go} step={6} title="What is your height?" subtitle="Scroll the ruler to select your height"
      prev="setupWeight" next="diab0"
    >
      <View style={styles.unitToggleRow}>
        <TouchableOpacity 
            style={[styles.unitToggleBtn, unit === 'ft' && styles.unitToggleBtnActive]}
            onPress={() => setSetupData(prev => ({ ...prev, heightUnit: 'ft' }))}
        >
          <Text style={{color: unit === 'ft' ? '#FFF' : '#111827', fontWeight: '700'}}>ft</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.unitToggleBtn, unit === 'cm' && styles.unitToggleBtnActive]}
            onPress={() => setSetupData(prev => ({ ...prev, heightUnit: 'cm' }))}
        >
          <Text style={{color: unit === 'cm' ? '#FFF' : '#111827', fontWeight: '700'}}>cm</Text>
        </TouchableOpacity>
      </View>

      {/* Caret Indicator - Hidden when editing */}
      {!editing && (
      <View style={styles.caretContainer}>
        <Ionicons name="caret-down" size={24} color="#70d6ff" />
      </View>
      )}

      {/* Value Display Box - Inline Editing */}
      <TouchableOpacity 
        style={styles.valueBox}
        onPress={() => {
          setInputValue(unit === 'ft' ? currentHeight.toFixed(1) : currentHeight.toString());
          setEditing(true);
        }}
        disabled={editing}
      >
        {editing ? (
          <TextInput
            style={styles.valueBoxInput}
            placeholder="Height"
            placeholderTextColor="#9CA3AF"
            keyboardType={unit === 'ft' ? 'decimal-pad' : 'numeric'}
            value={inputValue}
            onChangeText={setInputValue}
            onBlur={handleEditConfirm}
            onSubmitEditing={handleEditConfirm}
            autoFocus
            maxLength={unit === 'ft' ? 4 : 3}
            underlineColorAndroid="transparent"
          />
        ) : (
          <Text style={styles.valueBoxText}>
            {unit === 'ft' ? currentHeight.toFixed(1) : currentHeight}
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
          const displayValue = unit === 'ft' ? item.toFixed(1) : item;
          return (
            <View style={styles.rulerItem}>
              <View style={[
                styles.rulerTick,
                (unit === 'ft' ? item % 0.5 === 0 : item % 10 === 0) ? styles.rulerTickLong : styles.rulerTickShort,
                isHighlighted && styles.rulerTickHighlighted
              ]} />
              {(unit === 'ft' ? item % 0.2 === 0 : item % 5 === 0) && (
                <Text style={[styles.rulerLabel, isHighlighted && styles.rulerLabelHighlighted]}>
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
          paddingHorizontal: (width / 2) - 30,
        }}
        style={styles.rulerScroll}
      />
    </StepFrame>
  );
}

// --- New Diabetes + Extra Setup Screens ---
export function DiabetesIntro({ go }) {
  return (
    <StepFrame go={go} step={7} title="Tell us about your health" subtitle="This helps tailor glucose targets, reminders, and food recommendations." prev="setupHeight" next="diab1">
      <View style={styles.rootCenter}>
        <Text style={{ fontSize: 56 }}>🩺</Text>
        <Text style={styles.centerTitle}>Tell us about your health</Text>
        <Text style={styles.centerText}>This helps tailor glucose targets, reminders, and food recommendations.</Text>
        <View style={{ width: '100%', marginTop: 18 }}>
          <PurpleButton label="Let's Go" onPress={() => go('diab1')} />
        </View>
      </View>
    </StepFrame>
  );
}

export function Diabetes1({ go, setupData, setSetupData }) {
  const options = ['Type 1 Diabetes', 'Type 2 Diabetes', 'Prediabetes', 'Healthy Lifestyle'];
  return (
    <StepFrame go={go} step={1} total={3} title="What is your health condition?" subtitle="Choose the option that best describes you" prev="diab0" next="diab2">
      {options.map((opt) => (
        <OptionCard key={opt} label={opt} selected={setupData?.diabetesType === opt} onPress={() => setSetupData((p = {}) => ({ ...p, diabetesType: opt }))} />
      ))}
    </StepFrame>
  );
}

export function Diabetes2({ go, setupData, setSetupData }) {
  const meds = ['On insulin', 'Oral medication', 'No medication'];
  const durations = ['Just found out', 'Less than 1 year', '1-3 years', '3-5 years', '5+ years', 'Not diagnosed'];
  return (
    <StepFrame go={go} step={2} total={3} title="A bit more about you" subtitle="Medication and diagnosis history" prev="diab1" next="diab3">
      <Text style={styles.groupTitle}>Medication / Insulin</Text>
      {meds.map((m) => (
        <OptionCard key={m} label={m} selected={setupData?.onMedication === m} onPress={() => setSetupData((p = {}) => ({ ...p, onMedication: m }))} />
      ))}

      <Text style={styles.groupTitle}>How long diagnosed?</Text>
      <View style={styles.chipWrap}>
        {durations.map((d) => (
          <Pill key={d} active={setupData?.diagnosedDuration === d} onPress={() => setSetupData((p = {}) => ({ ...p, diagnosedDuration: d }))}>
            {d}
          </Pill>
        ))}
      </View>
    </StepFrame>
  );
}

export function Diabetes3({ go, setupData, setSetupData }) {
  const frequencies = ['Daily', 'Weekly', 'Rarely', 'Never'];
  return (
    <StepFrame go={go} step={3} total={3} title="Do you check your blood sugar?" subtitle="We use this to set the right reminders" prev="diab2" next="setup8">
      {frequencies.map((f) => (
        <OptionCard key={f} label={f} selected={setupData?.checkFrequency === f} onPress={() => setSetupData((p = {}) => ({ ...p, checkFrequency: f }))} />
      ))}
    </StepFrame>
  );
}

export function Setup8({ go, setupData, setSetupData }) {
  const levels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
  return (
    <StepFrame go={go} step={8} title="How active is your daily life?" subtitle="This helps calculate your needs" prev="diab3" next="setupgen">
      {levels.map((level) => (
        <OptionCard key={level} label={level} selected={setupData?.level === level} onPress={() => {
          setSetupData((p = {}) => ({ ...p, level }));
          // auto-advance to generating once user selects activity
          setTimeout(() => go('setupgen'), 350);
        }} />
      ))}

      <Text style={styles.groupTitle}>Preferred Glucose Unit</Text>
      <View style={styles.chipWrap}>
        {(['mg/dL', 'mmol/L']).map((unit) => (
          <Pill key={unit} active={setupData?.glucoseUnit === unit} onPress={() => setSetupData((p = {}) => ({ ...p, glucoseUnit: unit }))}>
            {unit}
          </Pill>
        ))}
      </View>

      <Text style={styles.groupTitle}>Emergency Contact (Optional)</Text>
      <InputField
        icon="👥"
        placeholder="Emergency contact name"
        value={setupData?.emergencyContactName}
        onChangeText={(emergencyContactName) => setSetupData((p = {}) => ({ ...p, emergencyContactName }))}
      />
      <InputField
        icon="☎"
        placeholder="Caregiver phone"
        value={setupData?.caregiverPhone}
        onChangeText={(caregiverPhone) => setSetupData((p = {}) => ({ ...p, caregiverPhone }))}
      />
    </StepFrame>
  );
}

export function SetupGenerating({ go }) {
  // showing the asset and a simple spinner animation
  return (
    <AnimatedScreen>
      <View style={styles.rootCenter}>
        <Image source={require('../../../assets/Setup Generating.png')} style={{ width: 260, height: 260, resizeMode: 'contain' }} />
        <Text style={[styles.centerText, { marginTop: 20 }]}>Generating your personalized plan...</Text>
        <ActivityIndicator size="large" color="#825CFF" style={{ marginTop: 18 }} />
      </View>
    </AnimatedScreen>
  );
}

export function SetupGeneratingComplete({ go }) {
  return (
    <AnimatedScreen>
      <View style={styles.rootCenter}>
        <Image source={require('../../../assets/Setup Generating Complete.png')} style={{ width: 300, height: 300, resizeMode: 'contain' }} />
        <Text style={styles.centerTitle}>All Set!</Text>
        <Text style={styles.centerText}>Your account is ready. Start your Reversia journey now.</Text>
        <View style={{ width: '100%', marginTop: 18 }}>
          <PurpleButton label="Start Journey" onPress={() => go('MainApp')} />
        </View>
      </View>
    </AnimatedScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  // Header & Navigation
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    height: 80 
  },
  backBtn: { width: 40 },
  progressContainer: { flex: 1, alignItems: 'center' },
  stepCounterText: { fontSize: 16, fontWeight: '700', color: '#D1D5DB' },
  skipBtn: { 
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  skipText: { color: '#9CA3AF', fontWeight: '600' },
  
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 120 },
  mainTitle: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#825CFF', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  mainSubtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 40, 
    lineHeight: 22 
  },

  horizontalPicker: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 15,
    marginTop: 40 
  },
  ageNode: { padding: 10 },
  ageNodeActive: { 
    backgroundColor: '#F5F3FF', 
    borderRadius: 20, 
    width: 80, 
    height: 80, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  ageText: { fontSize: 24, color: '#D1D5DB', fontWeight: '600' },
  ageTextActive: { color: '#825CFF', fontSize: 40, fontWeight: '800' },
  
  unitToggleRow: { 
    flexDirection: 'row', 
    alignSelf: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 25, 
    padding: 5, 
    marginBottom: 30 
  },
  unitToggleBtn: { paddingHorizontal: 35, paddingVertical: 12, borderRadius: 22 },
  unitToggleBtnActive: { backgroundColor: '#70d6ff' },
  
  caretContainer: {
    alignItems: 'center',
    marginBottom: -12,
    zIndex: 10,
  },
  
  valueBox: { 
    backgroundColor: '#F0F9FF', 
    paddingHorizontal: 50, 
    paddingVertical: 20, 
    borderRadius: 25, 
    alignSelf: 'center',
    marginVertical: 25,
    minWidth: 120,
  },
  valueBoxText: { fontSize: 48, fontWeight: '800', color: '#70d6ff', textAlign: 'center' },
  
  rulerScroll: {
    height: 80,
  },
  rulerItem: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  rulerTick: {
    width: 2,
    backgroundColor: '#D1D5DB',
  },
  rulerTickShort: {
    height: 20,
  },
  rulerTickLong: {
    height: 40,
    backgroundColor: '#825CFF',
  },
  rulerTickHighlighted: {
    width: 3,
    backgroundColor: '#70d6ff',
  },
  rulerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 8,
  },
  rulerLabelHighlighted: {
    color: '#70d6ff',
    fontWeight: '900',
    fontSize: 13,
  },
  
  rulerContainer: { alignItems: 'center', marginTop: 20 },
  metricDisplayBox: { 
    backgroundColor: '#F0F9FF', 
    paddingHorizontal: 50, 
    paddingVertical: 25, 
    borderRadius: 25, 
    marginBottom: 30 
  },
  metricDisplayText: { fontSize: 52, fontWeight: '800', color: '#70d6ff' },

  // Gender Cards
  genderGrid: { flexDirection: 'row', gap: 15 },
  genderCard: { 
    flex: 1, 
    borderRadius: 24, 
    backgroundColor: '#F3F4F6', 
    padding: 12, 
    alignItems: 'center' 
  },
  genderCardActive: { backgroundColor: '#70d6ff' },
  genderIllustration: { 
    width: '100%', 
    height: 200, 
    borderRadius: 20, 
    marginBottom: 10 
  },
  genderLabel: { fontWeight: '700', color: '#9CA3AF', fontSize: 16 },
  genderLabelActive: { color: '#FFF' },

  // Country Selection Cards
  selCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 12, 
    borderWidth: 2, 
    borderColor: '#F3F4F6' 
  },
  selCardActive: { borderColor: '#825CFF', backgroundColor: '#F5F3FF' },
  selIconBox: { 
    width: 52, 
    height: 52, 
    borderRadius: 18, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  selIconBoxActive: { backgroundColor: '#FFF' },
  selLabel: { flex: 1, fontSize: 17, fontWeight: '700', color: '#4B5563' },
  radio: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#D1D5DB', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  radioActive: { borderColor: '#825CFF' },
  radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#825CFF' },

  // Input
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 12, 
    marginLeft: 4 
  },
  modernInput: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 18, 
    padding: 20, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111827', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },

  // Footer
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    paddingHorizontal: 24, 
    backgroundColor: 'transparent' 
  },
  continueBtn: { 
    backgroundColor: '#825CFF', 
    height: 65, 
    borderRadius: 35, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  continueBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  
  childrenContainer: { marginTop: 20 },

  // Inline Edit Input
  valueBoxInput: {
    fontSize: 48,
    fontWeight: '800',
    color: '#70d6ff',
    textAlign: 'center',
    padding: 0,
    borderWidth: 0,
    outlineWidth: 0,
  },
});