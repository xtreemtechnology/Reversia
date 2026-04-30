import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

// 1. FIREBASE IMPORTS
import { auth, db } from '../../config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export default function AccountSetupName({ navigation }) {
  // Initializing with an empty string so the user can type their own name
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (name.trim().length < 2) {
      Alert.alert("Name required", "Please enter your real name to continue.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // 2. SAVE NAME TO FIRESTORE
        // We use merge: true so we don't overwrite other data if it exists
        await setDoc(doc(db, "users", user.uid), {
          displayName: name.trim(),
          onboardingStep: 1,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        navigation.navigate('AccountSetupGender');
      }
    } catch (error) {
      console.log("Error saving name:", error);
      Alert.alert("Error", "We couldn't save your name. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header with Back and Skip */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => navigation.navigate('AccountSetupGender')}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Progress Indicator */}
          <Text style={styles.progressText}>
            <Text style={styles.progressActive}>1</Text> / 8
          </Text>

          <Text style={styles.title}>What is your name?</Text>
          <Text style={styles.subtitle}>
            Please give some true answers for the following questions
          </Text>

          {/* Large Pill Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              textAlign="center"
              autoFocus={true}
              autoCapitalize="words"
              disabled={loading}
            />
          </View>
        </View>

        {/* Bottom Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, loading && { opacity: 0.7 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueText}>Continue</Text>
                <AntDesign name="arrowright" size={20} color="#FFF" style={styles.icon} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  progressText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '600',
  },
  progressActive: {
    color: '#825CFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#825CFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 50,
  },
  inputContainer: {
    width: '100%',
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#825CFF',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  input: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#825CFF',
    height: 65,
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  icon: {
    marginLeft: 10,
  },
});