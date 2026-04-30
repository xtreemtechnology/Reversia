import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserLogs } from '../hooks/useUserLogs';
import moment from 'moment';

const logCards = [
  { title: 'Glucose', subtitle: 'Record a reading', icon: 'water', color: '#DBEAFE', iconColor: '#3B82F6' },
  { title: 'Meal', subtitle: 'Add food and carbs', icon: 'food-apple', color: '#DCFCE7', iconColor: '#10B981' },
  { title: 'Water', subtitle: 'Track hydration', icon: 'cup-water', color: '#E0F2FE', iconColor: '#0EA5E9' },
  { title: 'Exercise', subtitle: 'Log activity', icon: 'run', color: '#FCE7F3', iconColor: '#EC4899' },
];

export default function LogScreen({ navigation }) {
  // Fetch real-time logs from Firestore
  const { logs, loading, error } = useUserLogs(15); 

  // Dynamic style helper
  const getLogConfig = (type) => {
    switch (type) {
      case 'glucose':
        return { dotColor: '#3B82F6', label: 'Glucose reading', statusColor: '#3B82F6' };
      case 'meal':
        return { dotColor: '#10B981', label: 'Meal log', statusColor: '#10B981' };
      case 'water':
        return { dotColor: '#0EA5E9', label: 'Hydration', statusColor: '#0EA5E9' };
      default:
        return { dotColor: '#825CFF', label: 'Activity', statusColor: '#825CFF' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Quick logging</Text>
            <Text style={styles.title}>Log Section</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="calendar-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="lightning-bolt" size={28} color="#825CFF" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Track Your Reversal</Text>
            <Text style={styles.heroText}>Consistent logging is the fastest way to master your insulin response.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What do you want to log?</Text>
        
        {/* Grid of Log Options */}
        <View style={styles.grid}>
          {logCards.map((item) => (
            <TouchableOpacity 
              key={item.title} 
              style={styles.gridCard}
              onPress={() => {
                if (item.title === 'Glucose') navigation.navigate('GlucoseEntry');
                else if (item.title === 'Meal') navigation.navigate('MealEntry');
                else if (item.title === 'Water') navigation.navigate('WaterEntry');
                else if (item.title === 'Exercise') navigation.navigate('ExerciseEntry');
              }}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon} size={26} color={item.iconColor} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Ionicons name="add-circle" size={20} color="#E5E7EB" style={styles.cardAddIcon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity List */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          <TouchableOpacity>
             {loading ? (
                <ActivityIndicator size="small" color="#825CFF" />
             ) : (
                <Text style={styles.seeAll}>See All</Text>
             )}
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error loading logs: {error.message || String(error)}</Text>
          </View>
        ) : null}

        <View style={styles.recentList}>
          {logs.length === 0 && !loading ? (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptyText}>No logs found for today.</Text>
            </View>
          ) : (
            logs.map((item) => {
              const config = getLogConfig(item.type);
              return (
                <TouchableOpacity key={item.id} style={styles.recentCard}>
                  <View style={styles.recentLeft}>
                    <View style={[styles.recentDot, { backgroundColor: config.dotColor }]} />
                    <View>
                      <Text style={styles.recentLabel}>{config.label}</Text>
                      <Text style={styles.recentValue}>
                        {item.value} {item.unit || ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recentRight}>
                    <Text style={styles.recentTime}>
                        {item.timestamp ? moment(item.timestamp.toDate()).format('h:mm A') : 'Just now'}
                    </Text>
                    <Text style={[styles.recentStatus, { color: config.statusColor }]}>
                      {item.period || 'Logged'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  kicker: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginTop: 2 },
  iconBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84 },
  heroCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 24, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#F3F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  heroText: { fontSize: 13, lineHeight: 19, color: '#6B7280', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 22 },
  gridCard: { width: '48%', minHeight: 145, backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  cardIcon: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 4, lineHeight: 16 },
  cardAddIcon: { position: 'absolute', top: 16, right: 16 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#825CFF' },
  recentList: { gap: 12 },
  recentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 16, elevation: 1, borderWidth: 1, borderColor: '#F9FAFB' },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recentDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  recentLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  recentValue: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  recentRight: { alignItems: 'flex-end', marginLeft: 10 },
  recentTime: { fontSize: 11, color: '#9CA3AF' },
  recentStatus: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 20, opacity: 0.5 },
  emptyText: { marginTop: 10, fontSize: 14, color: '#6B7280' }
  ,
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 10, marginBottom: 12 },
  errorText: { color: '#B91C1C', fontSize: 13 }
});