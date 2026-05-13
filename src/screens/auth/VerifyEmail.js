// src/screens/auth/VerifyEmail.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmail({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(59);
  
  // Dynamic email from route params, with a fallback placeholder
  const userEmail = route.params?.email || "naura.adinda80@gmail.com";

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your Email</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Verification Illustration from Design */}
        <View style={styles.illustrationContainer}>
          <View style={styles.imageCircle}>
             <Ionicons name="mail-unread-outline" size={70} color="#825CFF" />
          </View>
          {/* Brand decorative elements */}
          <View style={[styles.dot, { backgroundColor: '#22C55E', top: 10, left: -10 }]} />
          <View style={[styles.dot, { backgroundColor: '#F97316', top: 0, right: 0, width: 20, height: 20 }]} />
          <View style={[styles.dot, { backgroundColor: '#825CFF', bottom: 20, left: -20, opacity: 0.4 }]} />
          <View style={[styles.dot, { backgroundColor: '#BBF7D0', bottom: 0, right: -10 }]} />
        </View>

        <Text style={styles.instructionText}>
          Please enter the 6 digit OTP code that we sent to your email ({userEmail})
        </Text>

        {/* 6-Digit OTP Input Area */}
        <View style={styles.otpInputContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="0 0 0 0 0 0"
            placeholderTextColor="#D1D5DB"
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            letterSpacing={10}
            underlineColorAndroid="transparent"
            outlineStyle="none"
          />
        </View>

        <TouchableOpacity disabled={timer > 0} style={styles.resendButton}>
          <Text style={styles.resendText}>
            Resend code ({timer < 10 ? `00:0${timer}` : `00:${timer}`})
          </Text>
        </TouchableOpacity>

        {/* Confirm and proceed to user profile */}
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={() => navigation.navigate('EmailVerificationSuccess')}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  backButton: { padding: 8 },
  content: { flex: 1, paddingHorizontal: 25, alignItems: 'center', paddingTop: 20 },
  illustrationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  imageCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F3F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
  instructionText: {
    fontSize: 15,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  otpInputContainer: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    marginBottom: 30,
  },
  otpInput: { fontSize: 22, fontWeight: '600', color: '#000' },
  resendButton: { marginBottom: 40 },
  resendText: { color: '#9CA3AF', textDecorationLine: 'underline', fontSize: 16 },
  sendButton: {
    backgroundColor: '#825CFF',
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  sendButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});