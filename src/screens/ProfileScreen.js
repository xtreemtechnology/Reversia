import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useUserProfile } from '../hooks/useUserProfile';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import AnimatedScreen from '../components/AnimatedScreen';

export default function ProfileScreen({ navigation }) {
  const { userData } = useUserProfile();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (err) {
      console.error('Sign out failed', err);
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
        <View style={styles.header}>
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
          <MilestoneItem icon="target" color="#10B981" bgColor="#DCFCE7" title="In-Range Days" progress="78%" />
        </View>

        {/* Settings List */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsList}>
          <SettingItem icon="bell-outline" title="Notifications" />
          <SettingItem icon="shield-check-outline" title="Privacy" />
          <SettingItem icon="account-edit-outline" title="Edit Profile" />
        </View>

        {/* COMPACT LOGOUT BUTTON */}
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

const SettingItem = ({ icon, title }) => (
  <TouchableOpacity style={styles.settingRow}>
    <View style={styles.settingLeft}>
      <MaterialCommunityIcons name={icon} size={22} color="#4B5563" />
      <Text style={styles.settingTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  header: { alignItems: 'center', marginVertical: 20 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#825CFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#111827', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F9FAFB' },
  userName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  userEmail: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  unit: { fontSize: 12, color: '#9CA3AF' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  milestoneCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 25, borderWidth: 1, borderColor: '#F3F4F6' },
  milestoneItem: { flexDirection: 'row', alignItems: 'center' },
  milestoneIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  milestoneTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  milestoneProgress: { fontSize: 14, fontWeight: '800', color: '#825CFF' },
  milestoneDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  settingsList: { backgroundColor: '#FFF', borderRadius: 20, padding: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingTitle: { fontSize: 14, color: '#374151', fontWeight: '600' },
  logoutBtn: { marginTop: 30, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 }
});