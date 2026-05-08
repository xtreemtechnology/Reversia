// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen    from '../screens/HomeScreen';
import LogScreen     from '../screens/LogScreen';
import ScanScreen    from '../screens/ScanScreen';
import MealPlanScreen from '../features/meals/screens/MealPlanScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// ─── Constants ────────────────────────────────────────────────────────────────
const TAB_BAR_HEIGHT    = 62;   // visible bar height (icon + label)
const SCAN_BTN_HEIGHT   = 60;   // center scan button diameter
const ANDROID_EXTRA_PAD = 12;   // breathing room above Android system nav
const IOS_LABEL_PAD     = 4;

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  // On Android, insets.bottom can be 0 with gesture nav or ~24 with 3-button nav.
  // We always add a minimum extra padding so the bar never touches the system bar.
  const androidBottom = Math.max(insets.bottom, ANDROID_EXTRA_PAD);
  const iosBottom     = insets.bottom; // iOS safe area is reliable

  const tabBarHeight = Platform.select({
    android: TAB_BAR_HEIGHT + androidBottom,
    ios:     TAB_BAR_HEIGHT + iosBottom,
  });

  const tabBarPaddingBottom = Platform.select({
    android: androidBottom,
    ios:     iosBottom + IOS_LABEL_PAD,
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#825CFF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          ...styles.tabBar,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color }) => {
          const s = 24;
          switch (route.name) {
            case 'Home':
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={s} color={color} />;
            case 'Log':
              return <MaterialCommunityIcons name={focused ? 'plus-circle' : 'plus-circle-outline'} size={s} color={color} />;
            case 'Scan':
              return null; // custom button below
            case 'Meal':
              return <MaterialCommunityIcons name={focused ? 'silverware-fork-knife' : 'silverware-fork-knife'} size={s} color={color} />;
            case 'Profile':
              return <Ionicons name={focused ? 'person' : 'person-outline'} size={s} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{ tabBarLabel: 'Log' }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => (
            <ScanTabButton {...props} bottomPad={tabBarPaddingBottom} />
          ),
        }}
      />
      <Tab.Screen
        name="Meal"
        component={MealPlanScreen}
        options={{ tabBarLabel: 'Meals' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// ─── Custom Scan (centre) Button ──────────────────────────────────────────────
// Positioned at the center of the tab bar without excessive lift
function ScanTabButton({ onPress, onLongPress, accessibilityRole, accessibilityState, testID, bottomPad }) {
  // Lift button so it sits centered on the tab bar, overlapping slightly
  const liftAmount = -(SCAN_BTN_HEIGHT / 2 - TAB_BAR_HEIGHT / 2);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      testID={testID}
      style={[styles.scanWrap, { top: liftAmount }]}
      activeOpacity={0.85}
    >
      <View style={styles.scanRing}>
        <View style={styles.scanBtn}>
          <Ionicons name="scan" size={24} color="#FFF" />
        </View>
      </View>
      <Text style={styles.scanLabel}>Scan</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    // Shadow
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },

  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // ── Scan button ──
  scanWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    // Don't add paddingBottom here — it shifts the label position
  },
  scanRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    // White ring acts as a border that hides the tab bar line underneath
    shadowColor: '#825CFF',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  scanBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#825CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#825CFF',
    marginTop: 3,
    marginBottom: Platform.OS === 'android' ? 6 : 2,
  },
});