import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NavItem = ({ name, icon, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={24} color={active ? '#825CFF' : '#9CA3AF'} />
    <Text style={[styles.navText, active && styles.activeText]}>{name}</Text>
  </TouchableOpacity>
);

export const NavigationBar = ({ activeScreen }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const bottomOffset = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom;

  const handleNavigation = (screen) => {
    // Navigate through MainTabs (nested in MainApp stack)
    if (screen === 'Home') navigation.navigate('MainTabs', { screen: 'Home' });
    else if (screen === 'Log') navigation.navigate('MainTabs', { screen: 'Log' });
    else if (screen === 'Scan') navigation.navigate('MainTabs', { screen: 'Scan' });
    else if (screen === 'Meal') navigation.navigate('MainTabs', { screen: 'Meal' });
    else if (screen === 'Profile') navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  return (
    <View style={[styles.navBar, { bottom: bottomOffset, paddingBottom: Math.max(bottomOffset, 8) }]}>
      <NavItem name="Home" icon="home-variant" active={activeScreen === 'Home'} onPress={() => handleNavigation('Home')} />
      <NavItem name="Log" icon="plus" active={activeScreen === 'Log'} onPress={() => handleNavigation('Log')} />
      <View style={styles.scanWrapper}>
        <TouchableOpacity style={styles.scanBtn} onPress={() => handleNavigation('Scan')}>
          <Ionicons name="scan" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <NavItem name="Meal" icon="silverware-fork-knife" active={activeScreen === 'Meal'} onPress={() => handleNavigation('Meal')} />
      <NavItem name="Profile" icon="account" active={activeScreen === 'Profile'} onPress={() => handleNavigation('Profile')} />
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: { position: 'absolute', width: '100%', height: 85, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingHorizontal: 15, elevation: 10, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { fontSize: 12, color: '#9CA3AF', marginTop: 5 },
  activeText: { color: '#825CFF', fontWeight: '500' },
  scanWrapper: { position: 'relative', top: -30 },
  scanBtn: { backgroundColor: '#825CFF', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});
