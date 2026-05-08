// src/features/onboarding/screens/AccountSetupName.js
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
} from 'react-native';
import { OnboardingHeader } from '../components/OnboardingHeader';
import { OnboardingProgress } from '../components/OnboardingProgress';
import { ContinueButton } from '../components/ContinueButton';
import { ErrorBox } from '../components/ErrorBox';
import { saveName } from '../services/onboardingService';

export default function AccountSetupName({ navigation }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleContinue = async () => {
    setError(null);
    if (name.trim().length < 2) {
      setError('Please enter your real name to continue.');
      return;
    }

    setLoading(true);
    try {
      await saveName(name);
      navigation.navigate('AccountSetupGender');
    } catch (err) {
      console.error('Error saving name:', err);
      setError('We couldn\'t save your name. Please check your connection.');
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
        <OnboardingHeader onBack={() => navigation.goBack()} />

        <View style={styles.content}>
          <OnboardingProgress current={1} />
          <Text style={styles.title}>What is your name?</Text>
          <Text style={styles.subtitle}>
            Please give some true answers for the following questions
          </Text>

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

          <ErrorBox error={error} />
        </View>

        <View style={styles.footer}>
          <ContinueButton onPress={handleContinue} loading={loading} />
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7C3AED',
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
    borderColor: '#7C3AED',
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
});
