// src/components/LottieMoment.jsx
//
// One-off celebration moments for Reversia: a meal logged, a weekly
// check-in saved, a plan milestone reached. Wraps lottie-react-native
// (already installed) with the three bundled animations in
// assets/animations/. Plays once by default — celebrations should never
// loop forever.
//
// Usage:
//   <LottieMoment animation="success-check" size={180} onAnimationFinish={...} />
//   <LottieMoment animation="confetti" size={260} speed={1.5} />

import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";

const SOURCES = {
  "success-check": require("../../assets/animations/success-check.json"),
  confetti: require("../../assets/animations/confetti.json"),
  "goal-achieved": require("../../assets/animations/goal-achieved.json"),
};

export const LOTTIE_ANIMATIONS = Object.keys(SOURCES);

export default function LottieMoment({
  animation = "success-check",
  size = 160,
  loop = false,
  speed = 1,
  autoPlay = true,
  endFrame,
  onAnimationFinish,
  style,
}) {
  const ref = useRef(null);
  const source = SOURCES[animation] || SOURCES["success-check"];

  // Some animations hold a static frame long after the motion ends (the
  // checkmark draws in ~0.7s but runs to frame 329). When endFrame is
  // given, play only up to it so onAnimationFinish fires promptly.
  useEffect(() => {
    if (autoPlay && endFrame != null) {
      ref.current?.play(0, endFrame);
    }
  }, [autoPlay, endFrame]);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={ref}
        source={source}
        autoPlay={endFrame == null && autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
        style={{ width: size, height: size }}
      />
    </View>
  );
}
