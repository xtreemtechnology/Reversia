import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BMICalculator from '../components/BMICalculator';
import AnimatedScreen from '../components/AnimatedScreen';
import { NavigationBar } from '../components/ScreenWithNav';

export default function BMICalculatorScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={{ flex: 1 }}>
        <BMICalculator navigation={navigation} />
      </AnimatedScreen>
      <NavigationBar activeScreen="Profile" />
    </SafeAreaView>
  );
}
 
const styles = {
  container: { flex: 1, backgroundColor: '#F9FAFB' },
};