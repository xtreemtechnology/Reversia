// src/features/auth/components/AuthButton.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const AuthButton = ({
  onPress,
  label = 'Sign In',
  loading = false,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[styles.button, (loading || disabled) && styles.buttonDisabled]}
    onPress={onPress}
    disabled={loading || disabled}
  >
    {loading ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <Text style={styles.text}>{label}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
