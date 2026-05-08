import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  useWindowDimensions,
  Modal,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserLogs } from '../hooks/useUserLogs';
import moment from 'moment';
import { getButtonAccessibility } from '../utils/accessibility';

const logCards = [
  { title: 'Glucose', subtitle: 'Record a reading', icon: 'water', color: '#DBEAFE', iconColor: '#3B82F6' },
  { title: 'Meal', subtitle: 'Add food and carbs', icon: 'food-apple', color: '#DCFCE7', iconColor: '#10B981' },
  { title: 'Water', subtitle: 'Track hydration', icon: 'cup-water', color: '#E0F2FE', iconColor: '#0EA5E9' },
  { title: 'Exercise', subtitle: 'Log activity', icon: 'run', color: '#FCE7F3', iconColor: '#EC4899' },
];

export default function LogScreen({ navigation }) {
  const [refreshToken, setRefreshToken] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 640;
  const gridCardWidth = isNarrow ? '100%' : '48%';
  // Fetch real-time logs from Firestore
  const { logs, loading, error } = useUserLogs(15, refreshToken); 

  const handleLogPress = (title) => {
    switch (title) {
      case 'Glucose':
        navigation.navigate('GlucoseEntry');
        break;
      case 'Meal':
        navigation.navigate('MealEntry');
        break;
      case 'Water':
        navigation.navigate('WaterEntry');
        break;
      case 'Exercise':
        navigation.navigate('ExerciseEntry');
        break;
      default:
        break;
    }
  };

  const [selectedLog, setSelectedLog] = useState(null);

  const openRecent = (item) => {
    if (item.type === 'meal') {
      setSelectedLog(item);
      return;
    }
    // fallback: navigate to appropriate entry screen
    if (item.type === 'glucose') return navigation.navigate('GlucoseEntry');
    if (item.type === 'water') return navigation.navigate('WaterEntry');
    return navigation.navigate('ExerciseEntry');
  };

  const handleRetry = () => {
    setRefreshToken((value) => value + 1);
  };

  const logAccessibilityKey = {
    Glucose: 'logGlucose',
    Meal: 'logMeal',
    Water: 'logWater',
    Exercise: 'logExercise',
  };

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
          <View style={styles.iconBtn} accessibilityElementsHidden>
            <Ionicons name="calendar-outline" size={22} color="#111827" />
          </View>
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
              style={[styles.gridCard, { width: gridCardWidth }]}
              onPress={() => handleLogPress(item.title)}
              {...getButtonAccessibility(logAccessibilityKey[item.title])}
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
           <TouchableOpacity
            onPress={() => navigation.navigate('LogHistory')}
            {...getButtonAccessibility('expandButton', 'deepLink')}
           >
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
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRetry}
              {...getButtonAccessibility('confirmButton')}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.recentList}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#825CFF" />
              <Text style={styles.emptyText}>Loading your recent logs...</Text>
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptyText}>No logs found for today.</Text>
            </View>
          ) : (
            logs.map((item) => {
              const config = getLogConfig(item.type);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentCard}
                  onPress={() => openRecent(item)}
                  {...getButtonAccessibility('expandButton', 'deepLink')}
                >
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
                      {item.meal || item.period || 'Logged'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        {/* Meal detail modal */}
        <Modal visible={!!selectedLog} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setSelectedLog(null)}>
            <View style={modalStyles.backdrop}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={modalStyles.sheet}>
                  <View style={modalStyles.headerRow}>
                    <Text style={modalStyles.modalTitle}>Log detail</Text>
                    <TouchableOpacity onPress={() => setSelectedLog(null)}>
                      <Ionicons name="close" size={22} color="#374151" />
                    </TouchableOpacity>
                  </View>
                  {selectedLog && (
                    <ScrollView>
                      {selectedLog.imageUri && (
                        <Image source={{ uri: selectedLog.imageUri }} style={modalStyles.image} />
                      )}
                      <Text style={modalStyles.fieldLabel}>Food</Text>
                      <Text style={modalStyles.fieldValue}>{selectedLog.value}</Text>
                      {selectedLog.calories !== undefined && (
                        <>
                          <Text style={modalStyles.fieldLabel}>Calories</Text>
                          <Text style={modalStyles.fieldValue}>{selectedLog.calories} kcal</Text>
                        </>
                      )}
                      {selectedLog.servingSize && (
                        <>
                          <Text style={modalStyles.fieldLabel}>Serving</Text>
                          <Text style={modalStyles.fieldValue}>{selectedLog.servingSize}</Text>
                        </>
                      )}
                      <Text style={modalStyles.fieldLabel}>Logged</Text>
                      <Text style={modalStyles.fieldValue}>{selectedLog.timestamp ? moment(selectedLog.timestamp.toDate()).format('MMM D, h:mm A') : 'Just now'}</Text>
                    </ScrollView>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  kicker: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginTop: 2 },
  iconBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, borderWidth: 1, borderColor: '#E5E7EB' },
  heroCard: { flexDirection: 'row', backgroundColor: '#F8FAFF', borderRadius: 24, padding: 18, marginBottom: 24, elevation: 1, borderWidth: 1, borderColor: '#E7E9FF' },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#ECEBFF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  heroText: { fontSize: 13, lineHeight: 19, color: '#6B7280', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 22 },
  gridCard: { minHeight: 145, backgroundColor: '#FBFBFD', borderRadius: 24, padding: 16, marginBottom: 15, elevation: 1, borderWidth: 1, borderColor: '#E8EBF3' },
  cardIcon: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 4, lineHeight: 16 },
  cardAddIcon: { position: 'absolute', top: 16, right: 16 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#825CFF' },
  recentList: { gap: 12 },
  recentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FCFCFE', borderRadius: 20, padding: 16, elevation: 1, borderWidth: 1, borderColor: '#E7EAF0' },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recentDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  recentLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  recentValue: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  recentRight: { alignItems: 'flex-end', marginLeft: 10 },
  recentTime: { fontSize: 11, color: '#9CA3AF' },
  recentStatus: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 20, opacity: 0.7, backgroundColor: '#FBFBFD', borderRadius: 20, paddingVertical: 22, borderWidth: 1, borderColor: '#E7EAF0' },
  emptyText: { marginTop: 10, fontSize: 14, color: '#6B7280' }
  ,
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#B91C1C', fontSize: 13 },
  retryBtn: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#FCA5A5' },
  retryText: { color: '#B91C1C', fontSize: 13, fontWeight: '700' }
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  image: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: '#6B7280', fontWeight: '700', marginTop: 8 },
  fieldValue: { fontSize: 16, color: '#111827', fontWeight: '700', marginTop: 4 },
});