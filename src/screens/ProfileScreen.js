import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUserLogs } from '../hooks/useUserLogs';
import { useMemo } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import AnimatedScreen from '../components/AnimatedScreen';

export default function ProfileScreen({ navigation }) {
  const { userData } = useUserProfile();
  const { logs } = useUserLogs(200);
  const inRangePercent = useMemo(() => {
    const SAFE_LOW = 70; const SAFE_HIGH = 140;
    const today = new Date();
    let inRangeDays = 0;
    const days = 14;
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.type === 'glucose' && (() => {
        const t = typeof l.timestamp?.toDate === 'function' ? l.timestamp.toDate() : new Date(l.timestamp);
        return t.toISOString().split('T')[0] === key;
      })());
      if (dayLogs.length) {
        const ok = dayLogs.some(l => Number(l.value) >= SAFE_LOW && Number(l.value) <= SAFE_HIGH);
        if (ok) inRangeDays += 1;
      }
    }
    return days ? Math.round((inRangeDays / days) * 100) : 0;
  }, [logs]);
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Splash');
    } catch (err) {
      console.error('Sign out failed', err);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.header, { marginTop: insets.top + 12 }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.firstName?.charAt(0) || 'D'} 
              </Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
               <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData?.firstName} {userData?.lastName}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{userData?.currentWeight || '--'}<Text style={styles.unit}>kg</Text></Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{userData?.height || '--'}<Text style={styles.unit}>cm</Text></Text>
          </View>
        </View>

        {/* Progress Section */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.milestoneCard}>
          <MilestoneItem icon="fire" color="#3B82F6" bgColor="#DBEAFE" title="7-Day Streak" progress="5/7" />
          <View style={styles.milestoneDivider} />
          <MilestoneItem icon="target" color="#10B981" bgColor="#DCFCE7" title="In-Range Days" progress={logs.length ? `${inRangePercent}%` : '--'} />
        </View>

        {/* Settings Sections */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsList}>
          <SettingItem icon="bell-outline" title="Notifications" onPress={() => navigation.navigate('NotificationSettings')} />
          <SettingItem icon="account-edit-outline" title="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <SettingItem icon="target" title="Health Goals" onPress={() => navigation.navigate('HealthGoals')} />
        </View>

        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <View style={styles.settingsList}>
          <SettingItem icon="shield-check-outline" title="Privacy Settings" onPress={() => navigation.navigate('PrivacySettings')} />
          <SettingItem icon="cloud-sync-outline" title="Data Sync" onPress={() => navigation.navigate('DataSync')} />
          <SettingItem icon="download" title="Export Health Data" onPress={() => navigation.navigate('ExportData')} />
        </View>

        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingsList}>
          <SettingItem icon="palette" title="Appearance" onPress={() => navigation.navigate('Appearance')} />
          <SettingItem icon="information-outline" title="About" onPress={() => navigation.navigate('About')} />
          <SettingItem icon="help-circle-outline" title="Help & Support" onPress={() => navigation.navigate('Support')} />
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.settingsList}>
          <SettingItem icon="lock-outline" title="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
          <SettingItem icon="delete-outline" title="Delete Account" isDangerous onPress={() => navigation.navigate('DeleteAccount')} />
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const MilestoneItem = ({ icon, color, bgColor, title, progress }) => (
  <View style={styles.milestoneItem}>
    <View style={[styles.milestoneIcon, { backgroundColor: bgColor }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.milestoneTitle}>{title}</Text>
    <Text style={styles.milestoneProgress}>{progress}</Text>
  </View>
);

const SettingItem = ({ icon, title, isDangerous, onPress }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <View style={styles.settingLeft}>
      <MaterialCommunityIcons name={icon} size={22} color={isDangerous ? '#EF4444' : '#4B5563'} />
      <Text style={[styles.settingTitle, isDangerous && { color: '#EF4444' }]}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={isDangerous ? '#FCA5A5' : '#9CA3AF'} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  header: { alignItems: 'center', marginVertical: 20 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#111827', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F8' },
  userName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: '#FBFBFD', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E7EAF0' },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  unit: { fontSize: 12, color: '#9CA3AF' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  milestoneCard: { backgroundColor: '#FBFBFD', borderRadius: 20, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#E7EAF0' },
  milestoneItem: { flexDirection: 'row', alignItems: 'center' },
  milestoneIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  milestoneTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  milestoneProgress: { fontSize: 14, fontWeight: '800', color: '#825CFF' },
  milestoneDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  settingsList: { backgroundColor: '#FBFBFD', borderRadius: 20, padding: 8, borderWidth: 1, borderColor: '#E7EAF0' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingTitle: { fontSize: 14, color: '#374151', fontWeight: '600' },
  logoutBtn: { marginTop: 30, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 }
});