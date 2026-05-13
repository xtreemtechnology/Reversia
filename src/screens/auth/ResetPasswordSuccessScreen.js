// src/screens/auth/ResetPasswordSuccessScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordSuccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.imageCircle}>
              <Ionicons name="thumbs-up" size={80} color="#825CFF" />
            </View>
          </View>
          {/* Decorative floating dots to match your UI */}
          <View style={[styles.dot, { backgroundColor: '#22C55E', top: 0, right: -20 }]} />
          <View style={[styles.dot, { backgroundColor: '#F97316', top: -30, left: 40 }]} />
          <View style={[styles.dot, { backgroundColor: '#825CFF', bottom: -10, left: -10, opacity: 0.3 }]} />
        </View>

        <Text style={styles.title}>Reset Password Success!</Text>
        <Text style={styles.subtitle}>
          Please re-login with your new password
        </Text>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: 50,
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#F3F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  imageCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#825CFF',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // Added shadow for that premium feel
    shadowColor: '#825CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});