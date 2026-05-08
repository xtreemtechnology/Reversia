// src/features/auth/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { AuthError } from '../components/AuthError';
import { AuthHeader } from '../components/AuthHeader';
import { signIn } from '../services/authService';
import { handleAuthError } from '../../../utils/errorHandling';
import { validateEmail } from '../../../utils/validation';

const ContainerWrapper = Platform.OS === 'web' ? View : TouchableWithoutFeedback;
const wrapperProps = Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss };

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigation.replace('MainApp');
    } catch (err) {
      const friendlyError = handleAuthError(err);
      setError(friendlyError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ContainerWrapper {...wrapperProps}>
            <AuthHeader onBack={() => navigation.goBack()} />

            <View style={styles.content}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your Reversia account</Text>

              <AuthInput
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AuthInput
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                showPasswordToggle={true}
                showPassword={showPassword}
                onPasswordToggle={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <AuthError error={error} onDismiss={() => setError(null)} />

              <AuthButton
                label="Sign In"
                onPress={handleSignIn}
                loading={loading}
                disabled={!email || !password}
              />

              <Text style={styles.orText}>or continue with</Text>

              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome name="google" size={20} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome name="facebook" size={20} color="#4267B2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome name="apple" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.signupLink}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signupButton}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ContainerWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
  content: { paddingTop: 32, paddingBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 32,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#D1D5DB',
    fontSize: 14,
    marginVertical: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupButton: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '700',
  },
});
