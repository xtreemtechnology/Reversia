import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function AIInsightModal({ visible, onClose }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.blurOverlay} />
        
        <View style={styles.modalContent}>
          {/* Handle for dragging feel */}
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.aiIcon}>
              <MaterialCommunityIcons name="robot-glow" size={28} color="#FFF" />
            </View>
            <View>
              <Text style={styles.title}>Addy AI Assistant</Text>
              <Text style={styles.subtitle}>Personalized Metabolic Strategy</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={30} color="#E5E7EB" />
            </TouchableOpacity>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.statusTitle}>Current State: <Text style={styles.statusGreen}>Optimizing</Text></Text>
            <Text style={styles.mainInsight}>
              "Daniel, your glucose trend is stable. Since you just logged a 
              <Text style={{fontWeight: '800'}}> Medium-GI meal</Text>, your insulin sensitivity window is 
              now open for the next 30 minutes."
            </Text>
          </View>

          <Text style={styles.recommendationLabel}>Recommended Actions</Text>
          
          <View style={styles.actionRow}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="walk" size={24} color="#825CFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>10-Min Power Walk</Text>
              <Text style={styles.actionDesc}>Will reduce your post-meal peak by approx. 22%.</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="cup-water" size={24} color="#0EA5E9" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Hydration Buffer</Text>
              <Text style={styles.actionDesc}>Drink 500ml of water now to aid filtration.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryAction} onPress={onClose}>
            <Text style={styles.primaryActionText}>Got it, I'm on it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  blurOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  aiIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#825CFF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6B7280' },
  closeBtn: { marginLeft: 'auto' },
  insightCard: { backgroundColor: '#F5F3FF', padding: 20, borderRadius: 24, marginBottom: 25, borderWidth: 1, borderColor: '#E0E7FF' },
  statusTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 },
  statusGreen: { color: '#10B981' },
  mainInsight: { fontSize: 16, color: '#4B5563', lineHeight: 24, fontWeight: '500' },
  recommendationLabel: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F3F4F6' },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  actionDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  primaryAction: { backgroundColor: '#111827', borderRadius: 20, padding: 18, alignItems: 'center', marginTop: 10 },
  primaryActionText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});