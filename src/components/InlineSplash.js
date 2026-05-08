import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

export default function InlineSplash() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Image source={require('../../assets/Reversia-Logo.png')} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="small" color="#0F172A" style={styles.indicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  indicator: {
    marginTop: 16,
  },
});
