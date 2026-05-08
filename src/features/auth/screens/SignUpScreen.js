// src/features/auth/screens/SignUpScreen.js
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
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { validateEmail, validatePassword, validateMatch } from '../../../utils/validation';
import { handleAuthError } from '../../../utils/errorHandling';
import { AuthButton } from '../components/AuthButton';
import { AuthError } from '../components/AuthError';
import { signUp } from '../services/authService';

export default function SignUpScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const socialButtonWidth = Math.max(72, (screenWidth - 80) / 3);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation) {
      setError('Please enter a valid email address.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] || 'Please use a stronger password.');
      return;
    }

    const matchValidation = validateMatch(password, confirmPassword, 'Passwords');
    if (!matchValidation.isValid) {
      setError(matchValidation.error);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      await signUp(email, password);
      navigation.replace('Setup');
    } catch (err) {
      if (err?.message === 'EMAIL_EXISTS') {
        setError('This email is already registered. Please log in or reset your password.');
      } else {
        const friendlyError = handleAuthError(err);
        setError(friendlyError.message);
      }
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
        <View style={styles.headerContainer}>
          <View style={styles.decorativeCircle} />
          <View style={styles.logoPlaceholder}>
            <Image
              source={require('../../../assets/Reversia-Logo.png')}
              style={{ width: 50, height: 50 }}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Reversia and start your reversal journey</Text>

          <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#7C3AED' : '#9CA3AF'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#7C3AED"
              cursorColor="#7C3AED"
            />
          </View>

          <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#7C3AED' : '#9CA3AF'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              selectionColor="#7C3AED"
              cursorColor="#7C3AED"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputWrapper, focusedInput === 'confirmPassword' && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'confirmPassword' ? '#7C3AED' : '#9CA3AF'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
              selectionColor="#7C3AED"
              cursorColor="#7C3AED"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <AuthError error={error} onDismiss={() => setError(null)} />

          <AuthButton
            label="Create Account"
            onPress={handleSignUp}
            loading={loading}
            disabled={!email || !password || !confirmPassword}
          />

          <Text style={styles.orText}>or sign up with</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { width: socialButtonWidth }]}>
              <FontAwesome name="google" size={22} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { width: socialButtonWidth }]}>
              <FontAwesome name="facebook" size={22} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { width: socialButtonWidth }]}>
              <FontAwesome name="apple" size={22} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { height: 180, justifyContent: 'center', alignItems: 'center' },
  decorativeCircle: { position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: '#F3F0FF' },
  logoPlaceholder: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', elevation: 2 },
  formContainer: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 28 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 14, height: 56, marginBottom: 16 },
  inputWrapperFocused: { borderColor: '#7C3AED', backgroundColor: '#F9F5FF' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#111827', fontSize: 16, paddingVertical: 0 },
  orText: { textAlign: 'center', color: '#D1D5DB', marginVertical: 20 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  socialButton: { height: 54, borderRadius: 27, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#6B7280' },
  signInText: { color: '#7C3AED', fontWeight: '700' },
});
