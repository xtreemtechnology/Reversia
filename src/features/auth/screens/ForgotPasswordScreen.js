// src/features/auth/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthHeader } from '../components/AuthHeader';
import { sendPasswordReset } from '../services/authService';

export default function ForgotPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleResetPassword = async () => {
    setStatus(null);

    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setStatus({
        type: 'success',
        message: 'Check your inbox for a link to reset your password.',
      });
    } catch (error) {
      let message = 'Something went wrong. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No user found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email address is badly formatted.';
      }
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.imageCircle}>
            <Ionicons name="lock-open-outline" size={80} color="#7C3AED" />
          </View>
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.instructionText}>
          Enter your email and we'll send you a reset link.
        </Text>

        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={20} color="#FFFFFF" />
          </View>
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' }]}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {status && (
          <View style={[
            styles.statusBox,
            status.type === 'success' ? styles.successBox : styles.errorBox,
          ]}>
            <Text style={[
              styles.statusText,
              status.type === 'success' ? styles.successText : styles.errorText,
            ]}>
              {status.message}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  illustrationContainer: { alignItems: 'center', marginBottom: 24 },
  imageCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#F3F0FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 10 },
  instructionText: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 26, lineHeight: 22 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 14, height: 56, marginBottom: 18 },
  inputWrapperFocused: { borderColor: '#7C3AED', backgroundColor: '#F9F5FF' },
  iconContainer: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  statusBox: { borderRadius: 12, padding: 14, marginBottom: 18 },
  successBox: { backgroundColor: '#DCFCE7' },
  errorBox: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 14, lineHeight: 20 },
  successText: { color: '#166534' },
  errorText: { color: '#B91C1C' },
  button: { backgroundColor: '#7C3AED', borderRadius: 14, height: 56, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
