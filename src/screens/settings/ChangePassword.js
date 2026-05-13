import React, { useState } from 'react';
import { validatePassword, validateMatch } from '../../utils/validation';
import { handleAuthError, logError } from '../../utils/errorHandling';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function ChangePassword({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all password fields');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Weak Password', passwordValidation.errors[0] || 'Please use a stronger password');
      return;
    }

    const matchValidation = validateMatch(newPassword, confirmPassword, 'Passwords');
    if (!matchValidation.isValid) {
      Alert.alert('Password Mismatch', matchValidation.error);
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Same Password', 'Your new password must be different from your current password');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to change your password');
        return;
      }
      
      if (user) {
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password changed successfully');
        navigation.goBack();
      }
    } catch (error) {
      logError('ChangePassword.handleChangePassword', error);
      const errorInfo = handleAuthError(error);
      Alert.alert(errorInfo.title, errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ label, value, onChangeText, isVisible, onToggleVisibility }) => (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeIcon}>
          <Ionicons name={isVisible ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.note}>For your security, please enter a strong password with a mix of uppercase, lowercase, numbers, and symbols.</Text>

        <PasswordInput 
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          isVisible={showCurrentPassword}
          onToggleVisibility={() => setShowCurrentPassword(!showCurrentPassword)}
        />

        <PasswordInput 
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          isVisible={showNewPassword}
          onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
        />

        <PasswordInput 
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isVisible={showConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.6 }]} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Updating...' : 'Change Password'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  content: { paddingHorizontal: 20, paddingVertical: 20 },
  note: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 24, backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#D97706', borderWidth: 1, borderColor: '#FDE68A' },
  section: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBFBFD', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, padding: 14, fontSize: 15, color: '#111827' },
  eyeIcon: { paddingRight: 14 },
  submitBtn: { backgroundColor: '#111827', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#111827' },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
