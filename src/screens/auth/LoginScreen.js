import React, { useState, useRef } from 'react';
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
  Platform,
  Image,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// 1. FIREBASE IMPORTS
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('MainApp');
    } catch (error) {
      console.error('SignIn error', error);
      let message = 'An error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      }
      setError(message);
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.purpleCard}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#825CFF" />
          </TouchableOpacity>
       KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <   <View style={[styles.circle, styles.circleSmall, { left: '40%', top: '10%' }]} />
          <View style={[styles.circle, styles.circleMedium, { left: '10%', bottom: -30 }]} />
          <View style={[styles.circle, styles.circleLarge, { right: -40, top: '10%' }]}>
             <Image 
               source={require('../../../assets/Reversia-Logo.png')} 
               style={{ width: 60, height: 60 }}
               resizeMode="contain"
             />
          </View>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={sstyles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
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
            cursorColor="#825CFF"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>

        {/* Password Input */}
        <View style={[
          styles.inputWrapper, 
          isPasswordFocused && styles.inputWrapperFocused 
        ]}>
          <Ionicons 
            name="lock-closed-outline" 
            size={20} 
            color={isPasswordFocused ? "#825CFF" : "#9ca3af"} 
            style={styles.inputIcon} 
          />
          <TextInputstyles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
          <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? "#825CFF" : "#9ca3af"} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
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
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af"nPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.orText}>or sign in with</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}><FontAwesome name="google" size={24} color="#DB4437" /></TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}><FontAwesome name="facebook" size={24} color="#4267B2" /></TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}><FontAwesome name="apple" size={24} color="#000000" /></TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { height: 220, overflow: 'hidden' },
  purpleCard: { backgroundColor: '#825CFF', height: 180, width: '85%', borderBottomRightRadius: 100, position: 'relative' },
  backButton: { width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginLeft: 20 },
  circle: { position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 100 },
  circleSmall: { width: 60, height: 60 },
  circleMedium: { width: 100, height: 100, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  circleLarge: { width: 160, height: 160, backgroundColor: '#EBE5FF', justifyContent: 'center', alignItems: 'center' },
  formContainer: { flex: 1, paddingHorizontal: 25, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 55,
    marginBottom: 20,
  },
  inputWrapperFocused: {
    borderColor: '#825CFF',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#825CFF',
      </KeyboardAvoidingView>
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIcon: { marginRight: 12 },
  input: { 
    flex: 1, 
    color: '#000', 
    fontSize: 16,
    paddingVertical: 0,
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
      native: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 30, paddingHorizontal: 20, height: 55, marginBottom: 15 },
  inputWrapperFocused: { borderColor: '#825CFF', backgroundColor: '#FFFFFF' },
  inputIcon: { marginRight: 12 },
  input: { 
    flex: 1, 
    color: '#000', 
    fontSize: 16,
    paddingVertical: 0,
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none'