import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  TextInput,
  useWindowDimensions 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../components/AnimatedScreen';
import { useNavigation } from '@react-navigation/native';

// useWindowDimensions available if runtime width needed

export default function EducationScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Academy');
  const insets = useSafeAreaInsets();

  const lessons = [
    { id: 1, title: "The Insulin 'Lock' Concept", duration: "3 min read", category: "Fundamentals", status: "Completed", color: "#825CFF", icon: "key-variant" },
    { id: 2, title: "Why Walk After Eating?", duration: "5 min read", category: "Lifestyle", status: "Up Next", color: "#10B981", icon: "run-fast" },
    { id: 3, title: "Fiber: Your Glucose Shield", duration: "4 min read", category: "Nutrition", status: "Locked", color: "#F59E0B", icon: "shield-check" }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
      {/* Custom Tab Header */}
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 20 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
      </View>

      <View style={[styles.tabContainer, { paddingTop: 10 }]}>
        {['Academy', 'Community'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'Academy' ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Reversal Academy</Text>
              <Text style={styles.subtitle}>Master your metabolism, one lesson at a time.</Text>
            </View>

            <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
              <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=500' }} 
                style={styles.featuredImage}
                imageStyle={{ borderRadius: 24 }}
              >
                <View style={styles.overlay}>
                  <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>MASTERCLASS</Text></View>
                  <Text style={styles.featuredTitle}>The 12-Week Reversal Blueprint</Text>
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '35%' }]} />
                    </View>
                    <Text style={styles.progressText}>35% Done</Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Daily Lessons</Text>
            {lessons.map((lesson) => (
              <TouchableOpacity 
                key={lesson.id} 
                style={[styles.lessonCard, lesson.status === 'Locked' && styles.lockedCard]} 
                disabled={lesson.status === 'Locked'}
              >
                <View style={[styles.iconBox, { backgroundColor: lesson.color + '15' }]}>
                  <MaterialCommunityIcons 
                    name={lesson.status === 'Locked' ? "lock" : lesson.icon} 
                    size={24} 
                    color={lesson.status === 'Locked' ? "#9CA3AF" : lesson.color} 
                  />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonCategory}>{lesson.category}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.metaText}>{lesson.duration}</Text>
                    {lesson.status === 'Completed' && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark" size={12} color="#10B981" />
                        <Text style={styles.completedText}>Done</Text>
                      </View>
                    )}
                  </View>
                </View>
                {lesson.status !== 'Locked' && <Ionicons name="play-circle" size={32} color={lesson.color} />}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Support Hub</Text>
              <Text style={styles.subtitle}>Get expert answers and find community motivation.</Text>
            </View>

            {/* Ask an Expert Input */}
            <View style={styles.expertInputBox}>
              <TextInput 
                placeholder="Ask a question..." 
                style={styles.input} 
                placeholderTextColor="#94a3b8" 
              />
              <TouchableOpacity style={styles.sendBtn}>
                <Ionicons name="send" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Success Stories</Text>
            <View style={styles.postCard}>
              <View style={styles.postUserRow}>
                <View style={styles.userAvatar}><Text style={styles.avatarText}>JO</Text></View>
                <View>
                  <Text style={styles.postUser}>James O.</Text>
                  <Text style={styles.postTime}>Verified • Reversed</Text>
                </View>
              </View>
              <Text style={styles.postText}>
                "My HbA1c dropped from 7.2 to 5.8 in 4 months. The Post-Meal Walk is real!"
              </Text>
              <View style={styles.postStats}>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text style={styles.statText}>124</Text>
                <Ionicons name="chatbubble-outline" size={16} color="#6B7280" style={{marginLeft: 15}} />
                <Text style={styles.statText}>18</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.supportCard}>
              <View style={styles.supportIconBg}>
                <MaterialCommunityIcons name="doctor" size={28} color="#825CFF" />
              </View>
              <View style={{marginLeft: 15, flex: 1}}>
                <Text style={styles.supportTitle}>Talk to a Specialist</Text>
                <Text style={styles.supportDesc}>Direct access to metabolic health coaches.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  headerBackBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, backgroundColor: '#FBFBFD', borderBottomWidth: 1, borderBottomColor: '#E7EAF0' },
  tab: { paddingVertical: 12, marginRight: 25, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#825CFF' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  activeTabText: { color: '#825CFF' },
  content: { padding: 20, paddingBottom: 110 },
  header: { marginBottom: 25 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  featuredCard: { height: 200, marginBottom: 30, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  featuredImage: { flex: 1, justifyContent: 'flex-end' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.35)', padding: 20, borderRadius: 24, height: '100%', justifyContent: 'flex-end' },
  featuredBadge: { backgroundColor: '#825CFF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  featuredBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  featuredTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginRight: 10 },
  progressBarFill: { height: 6, backgroundColor: '#FFF', borderRadius: 3 },
  progressText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 15, marginTop: 10 },
  lessonCard: { backgroundColor: '#FBFBFD', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#E7EAF0' },
  lockedCard: { opacity: 0.6 },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  lessonInfo: { flex: 1 },
  lessonCategory: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  lessonTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginVertical: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4, marginRight: 10 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  completedText: { fontSize: 10, fontWeight: '700', color: '#10B981', marginLeft: 2 },
  expertInputBox: { flexDirection: 'row', backgroundColor: '#FBFBFD', borderRadius: 16, padding: 6, marginBottom: 25, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  input: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: '#111827' },
  sendBtn: { backgroundColor: '#825CFF', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  postCard: { backgroundColor: '#FBFBFD', borderRadius: 24, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E7EAF0' },
  postUserRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#825CFF', fontWeight: '700', fontSize: 13 },
  postUser: { fontSize: 14, fontWeight: '700', color: '#111827' },
  postTime: { fontSize: 11, color: '#10B981', fontWeight: '600' },
  postText: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 12 },
  postStats: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  supportCard: { backgroundColor: '#F8FAFF', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#825CFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, borderWidth: 1, borderColor: '#E7E9FF' },
  supportIconBg: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
  supportTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  supportDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 }
});