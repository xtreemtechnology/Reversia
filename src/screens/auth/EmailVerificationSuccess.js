import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. IMPORT AUTH TO CHECK STATE IF NEEDED
import { auth } from '../../config/firebase';

export default function EmailVerificationSuccess({ navigation }) {
  const [statusMessage, setStatusMessage] = React.useState(null);

  // Optional: Double check verification status on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      user.reload(); // Refresh the user object to get the latest emailVerified status
    }
  }, []);

  const handleGetStarted = () => {
    // Check if user is actually verified before moving to onboarding
    if (auth.currentUser?.emailVerified) {
      navigation.navigate('OnboardingStart');
    } else {
      setStatusMessage("Your email isn't verified yet. Please check your inbox and tap the link.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.outerWavyCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="thumbs-up" size={80} color="#825CFF" />
            </View>
          </View>
          
          <View style={[styles.dot, { backgroundColor: '#22C55E', top: 0, right: -20 }]} />
          <View style={[styles.dot, { backgroundColor: '#F97316', top: -30, left: 40 }]} />
          <View style={[styles.dot, { backgroundColor: '#825CFF', bottom: -10, left: -10, opacity: 0.3 }]} />
          <View style={[styles.dot, { backgroundColor: '#BBF7D0', bottom: 20, right: -30 }]} />
        </View>

        <Text style={styles.title}>Verification Success!</Text>
        <Text style={styles.subtitle}>
          Your email has been confirmed. Let's start your journey to metabolic freedom!
        </Text>

        <TouchableOpacity 
          style={styles.getStartedButton}
          activeOpacity={0.8}
          onPress={handleGetStarted} // Logic added here
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        {statusMessage && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{statusMessage}</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
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
  outerWavyCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(130, 92, 255, 0.05)',
    borderWidth: 2,
    borderColor: '#F3F4FF',
    borderStyle: 'dashed',
  },
  innerCircle: {
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
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    backgroundColor: '#825CFF',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#825CFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusBox: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 14,
  },
  statusText: {
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'center',
    backgroundColor: '#825CFF',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});