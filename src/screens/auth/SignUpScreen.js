import React, { useState } from 'react';
import { validateEmail, validatePassword, validateMatch } from '../../utils/validation';
import { handleAuthError, logError } from '../../utils/errorHandling';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';

const { width } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
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
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Weak Password', passwordValidation.errors[0] || 'Please use a stronger password');
      return;
    }

    const matchValidation = validateMatch(password, confirmPassword, 'Passwords');
    if (!matchValidation.isValid) {
      Alert.alert('Password Mismatch', matchValidation.error);
      return;
    }


    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      if (methods && methods.length > 0) {
        Alert.alert(
          'Email Already Registered',
          'An account already exists with this email. Would you like to sign in or reset your password?',
          [
            { text: 'Sign In', onPress: () => navigation.navigate('Login', { email: email.trim() }) },
            { text: 'Reset Password', onPress: () => navigation.navigate('ForgotPassword', { email: email.trim() }) },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }

      // Navigate immediately so web/native behavior is consistent and doesn't
      // depend on Alert callback support.
      Alert.alert('Account Created', 'Your account is ready. We sent a verification email to your inbox.');
      navigation.replace('Setup');
    } catch (error) {
      console.error('SignUp error', error);
      let message = 'Could not create your account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email address is not valid.';
      }
      setError(message);
      Alert.alert('Sign Up Failed', message);
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

          {/* Email Input */}
          <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
            <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? "#825CFF" : "#9ca3af"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              selectionColor="#825CFF"
              cursorColor="#825CFF"
            />
          </View>

          {/* Password Input */}
          <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? "#825CFF" : "#9ca3af"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              underlineColorAndroid="transparent"
              selectionColor="#825CFF"
              cursorColor="#825CFF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={[styles.inputWrapper, focusedInput === 'confirmPassword' && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'confirmPassword' ? "#825CFF" : "#9ca3af"} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
              underlineColorAndroid="transparent"
              selectionColor="#825CFF"
              cursorColor="#825CFF"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signUpButtonText}>Sign Up</Text>}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.orText}>or sign up with</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}><FontAwesome name="google" size={24} color="#DB4437" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}><FontAwesome name="facebook" size={24} color="#4267B2" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}><FontAwesome name="apple" size={24} color="#000000" /></TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { email: email.trim() })}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { height: 180, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  decorativeCircle: { position: 'absolute', right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: '#F3F4FF' },
  logoPlaceholder: { width: 80, height: 80, borderRadius: 25, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#825CFF', shadowOpacity: 0.1, shadowRadius: 10, zIndex: 10 },
  formContainer: { flex: 1, paddingHorizontal: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30, marginTop: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 30, paddingHorizontal: 20, height: 55, marginBottom: 15 },
  inputWrapperFocused: { borderColor: '#825CFF', backgroundColor: '#FFFFFF' },
  inputIcon: { marginRight: 12 },
  input: { 
    flex: 1, 
    color: '#000', 
    fontSize: 16,
    paddingVertical: 0,
    borderWidth: 0,
    // Fix for the black browser focus ring
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  signUpButton: { backgroundColor: '#825CFF', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 25, elevation: 3 },
  signUpButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  orText: { textAlign: 'center', color: '#9ca3af', marginBottom: 25 },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  socialButton: { width: (width - 80) / 3, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666' },
  loginText: { color: '#825CFF', fontWeight: 'bold' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 8, marginTop: 8 },
  errorText: { color: '#B91C1C' }
});