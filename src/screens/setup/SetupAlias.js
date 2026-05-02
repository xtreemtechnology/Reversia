import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function SetupAlias({ navigation, route }) {
  useEffect(() => {
    const target = route?.name || route?.params?.screen || 'setupIntro';
    // Replace current screen with the nested Setup stack and set its initial screen
    navigation.replace('Setup', { screen: target });
  }, [navigation, route]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
