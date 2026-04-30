import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, View } from 'react-native';

export default function PressableScale({ children, onPress, style, activeScale = 0.96, duration = 100, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue) => {
    Animated.timing(scale, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={() => !disabled && animateTo(activeScale)}
      onPressOut={() => !disabled && animateTo(1)}
      onPress={() => !disabled && onPress && onPress()}
      disabled={disabled}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
