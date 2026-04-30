import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedScreen from '../components/AnimatedScreen';
import { NavigationBar } from '../components/ScreenWithNav';

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.text}>All Orders Screen</Text>
        </View>
      </AnimatedScreen>
      <NavigationBar activeScreen="Meal" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 110 },
  text: { fontSize: 18, fontWeight: '700', color: '#111827' },
});
