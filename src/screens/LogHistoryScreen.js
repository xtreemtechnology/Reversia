import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import { useUserLogs } from '../hooks/useUserLogs';
import { getButtonAccessibility } from '../utils/accessibility';

const getLogConfig = (type) => {
  switch (type) {
    case 'glucose':
      return { dotColor: '#3B82F6', label: 'Glucose reading', icon: 'water', iconColor: '#3B82F6' };
    case 'meal':
      return { dotColor: '#10B981', label: 'Meal log', icon: 'food-apple', iconColor: '#10B981' };
    case 'water':
      return { dotColor: '#0EA5E9', label: 'Hydration', icon: 'cup-water', iconColor: '#0EA5E9' };
    default:
      return { dotColor: '#825CFF', label: 'Activity', icon: 'run', iconColor: '#825CFF' };
  }
};

export default function LogHistoryScreen({ navigation }) {
  const { logs, loading, error } = useUserLogs(50);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          {...getButtonAccessibility('backButton')}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>All entries</Text>
          <Text style={styles.title}>Log History</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#825CFF" />
          <Text style={styles.stateText}>Loading your history...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={42} color="#EF4444" />
          <Text style={styles.stateTitle}>Could not load logs</Text>
          <Text style={styles.stateText}>{error.message || String(error)}</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.stateBox}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={42} color="#D1D5DB" />
          <Text style={styles.stateTitle}>No logs yet</Text>
          <Text style={styles.stateText}>Start tracking meals, water, glucose, or exercise to see them here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {logs.map((item) => {
            const config = getLogConfig(item.type);
            return (
              <View key={item.id} style={styles.card}>
                <View style={[styles.iconWrap, { backgroundColor: `${config.iconColor}18` }]}>
                  <MaterialCommunityIcons name={config.icon} size={22} color={config.iconColor} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.label}>{config.label}</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {item.value} {item.unit || ''}
                  </Text>
                  <Text style={styles.meta}>
                    {item.period || 'Logged'} • {item.timestamp ? moment(item.timestamp.toDate()).format('MMM D, h:mm A') : 'Just now'}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  kicker: { fontSize: 12, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontSize: 28, color: '#111827', fontWeight: '800', marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 1,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody: { flex: 1 },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  value: { fontSize: 16, color: '#111827', fontWeight: '800', marginTop: 4 },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  stateBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  stateTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 12, textAlign: 'center' },
  stateText: { fontSize: 13, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 18 },
});
