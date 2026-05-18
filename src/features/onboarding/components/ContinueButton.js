import React, { useRef, useEffect } from "react";
import { Animated, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shared } from "../styles/shared";
import T from "../../../theme/tokens";

const ActivityIndicatorDot = () => {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Ionicons name="reload" size={20} color={T.WHITE} />
    </Animated.View>
  );
};

export const PrimaryBtn = ({
  label = "Continue",
  onPress,
  loading = false,
  disabled = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading || disabled}
    activeOpacity={0.85}
    style={[shared.primaryBtn, (loading || disabled) && { opacity: 0.5 }]}
  >
    {loading ? (
      <ActivityIndicatorDot />
    ) : (
      <>
        <Text style={shared.primaryBtnText}>{label}</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={T.WHITE}
          style={{ marginLeft: 6 }}
        />
      </>
    )}
  </TouchableOpacity>
);

export const ContinueButton = PrimaryBtn;
export default PrimaryBtn;
