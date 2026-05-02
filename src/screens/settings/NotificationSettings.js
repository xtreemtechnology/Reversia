import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettings({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [glucoseAlerts, setGlucoseAlerts] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [exerciseReminders, setExerciseReminders] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [tips, setTips] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <SettingToggle 
            title="Enable Push Notifications" 
            value={pushEnabled}
            onToggle={setPushEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Alerts</Text>
          <SettingToggle 
            title="Glucose Out of Range" 
            value={glucoseAlerts}
            onToggle={setGlucoseAlerts}
            description="Alert when glucose levels are abnormal"
          />
          <SettingToggle 
            title="Meal Reminders" 
            value={mealReminders}
            onToggle={setMealReminders}
            description="Remind me to log meals"
          />
          <SettingToggle 
            title="Exercise Reminders" 
            value={exerciseReminders}
            onToggle={setExerciseReminders}
            description="Remind me to exercise"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports & Tips</Text>
          <SettingToggle 
            title="Weekly Health Report" 
            value={weeklyReport}
            onToggle={setWeeklyReport}
            description="Every Monday morning"
          />
          <SettingToggle 
            title="Health Tips" 
            value={tips}
            onToggle={setTips}
            description="AI-powered personalized tips"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const SettingToggle = ({ title, value, onToggle, description }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      {description && <Text style={styles.settingDesc}>{description}</Text>}
    </View>
    <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#D1D5DB', true: '#86EFAC' }} thumbColor={value ? '#10B981' : '#E5E7EB'} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  content: { paddingHorizontal: 20, paddingVertical: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FBFBFD', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E7EAF0' },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  settingDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
});
