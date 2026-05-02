import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserLogs } from '../hooks/useUserLogs';

const getDateKey = (value) => {
  if (!value) return null;
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

export default function ActivityTracker({ navigation }) {
  const { logs, loading } = useUserLogs(60);

  const todayKey = getDateKey(new Date());
  const todayLogs = useMemo(() => logs.filter((l) => getDateKey(l.timestamp) === todayKey), [logs]);
  const exerciseLogs = useMemo(() => todayLogs.filter((l) => l.type === 'exercise'), [todayLogs]);

  const totalMinutes = useMemo(() => exerciseLogs.reduce((s, l) => s + (Number(l.value) || 0), 0), [exerciseLogs]);
  const estimatedSteps = Math.round(totalMinutes * 100); // approx 100 steps per minute
  const estimatedCalories = Math.round(totalMinutes * 5); // rough kcal per minute

  const renderItem = ({ item }) => (
    <View style={styles.entryRow}>
      <View style={styles.entryLeft}>
        <MaterialCommunityIcons name="run" size={20} color="#1D4ED8" />
      </View>
      <View style={styles.entryBody}>
        <Text style={styles.entryTitle}>{item.title || item.activity || 'Exercise'}</Text>
        <Text style={styles.entryMeta}>{item.value} min • {item.note || item.period || getDateKey(item.timestamp)}</Text>
      </View>
      <View style={styles.entryRight}>
        <Text style={styles.entryValue}>{Math.round(Number(item.value) || 0)}m</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Tracker</Text>
        <TouchableOpacity style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Steps</Text>
            <Text style={styles.summaryValue}>{estimatedSteps.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Active</Text>
            <Text style={styles.summaryValue}>{totalMinutes} min</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Calories</Text>
            <Text style={styles.summaryValue}>{estimatedCalories} kcal</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Activities</Text>
        {exerciseLogs.length ? (
          <FlatList
            data={exerciseLogs}
            keyExtractor={(i) => i.id || `${i.timestamp?.seconds || i.timestamp}-${Math.random()}`}
            renderItem={renderItem}
            style={{ width: '100%' }}
          />
        ) : (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="run-fast" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>{loading ? 'Loading activities...' : "No activities logged today"}</Text>
            <TouchableOpacity style={styles.logBtn} onPress={() => navigation.navigate('ExerciseEntry')}>
              <Text style={styles.logBtnText}>Log Activity</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { flex: 1, paddingHorizontal: 20 },
  placeholder: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#FBFBFD', marginRight: 8, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E7EAF0' },
  summaryLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '700' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 10 },
  entryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  entryLeft: { width: 40, alignItems: 'center' },
  entryBody: { flex: 1 },
  entryTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  entryMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  entryRight: { width: 56, alignItems: 'flex-end' },
  entryValue: { fontSize: 13, fontWeight: '800', color: '#111827' },
  emptyBox: { alignItems: 'center', padding: 24, borderRadius: 12, backgroundColor: '#FBFBFD', borderWidth: 1, borderColor: '#E7EAF0' },
  emptyText: { marginTop: 8, color: '#9CA3AF', fontWeight: '700' },
  logBtn: { marginTop: 12, backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logBtnText: { color: '#FFF', fontWeight: '800' },
});
