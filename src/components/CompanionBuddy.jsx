import React, { useEffect, useRef, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

/**
 * Original, code-drawn Reversia companion illustration.
 * Built entirely from vector shapes — no generated or remote image assets.
 *
 * Idle life: the buddy breathes (a slow, subtle scale loop on the UI
 * thread) and blinks every few seconds (the eyes narrow briefly).
 * Both are gentle by design — the companion should feel alive, not
 * distracting — and neither changes layout: breathing is a transform,
 * the blink only swaps the eyes' height.
 *
 * Reactions: `expression` ("neutral" | "happy" | "celebrating") swaps
 * the face — happy eyes and a bigger smile, or an open joyful mouth
 * when the day is fully done. `bounceKey` is a counter the parent
 * bumps when something good just happened (a fresh check-in): the
 * buddy pops once, a spring up and back. The bounce multiplies with
 * the breath scale, so idle life keeps running underneath it.
 */
export default function CompanionBuddy({
  size = 116,
  expression = "neutral",
  bounceKey = 0,
}) {
  const face =
    expression === "happy" || expression === "celebrating"
      ? expression
      : "neutral";
  const breath = useSharedValue(1);
  const bounce = useSharedValue(1);
  const [blinking, setBlinking] = useState(false);
  const prevBounceKey = useRef(0);

  // Slow breathing loop: 1 -> 1.035 and back, ~2.8s per breath.
  useEffect(() => {
    breath.value = withRepeat(withTiming(1.035, { duration: 1400 }), -1, true);
  }, [breath]);

  // One happy pop each time the parent bumps bounceKey.
  useEffect(() => {
    if (bounceKey > 0 && bounceKey !== prevBounceKey.current) {
      prevBounceKey.current = bounceKey;
      bounce.value = withSequence(
        withTiming(1.2, { duration: 160 }),
        withSpring(1, { damping: 7, stiffness: 200 })
      );
    }
  }, [bounceKey, bounce]);

  // A blink every ~3-5s: eyes shut for 140ms, then open again.
  useEffect(() => {
    let blinkTimer;
    let shutTimer;
    let alive = true;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        if (!alive) return;
        setBlinking(true);
        shutTimer = setTimeout(() => {
          if (!alive) return;
          setBlinking(false);
          scheduleBlink();
        }, 140);
      }, 2800 + Math.random() * 1800);
    };
    scheduleBlink();
    return () => {
      alive = false;
      clearTimeout(blinkTimer);
      clearTimeout(shutTimer);
    };
  }, []);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breath.value * bounce.value }],
  }));

  return (
    <Animated.View style={breathStyle}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        accessibilityLabel="Reversia companion"
      >
        <Defs>
          <LinearGradient id="buddyBody" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#E9F5DC" />
            <Stop offset="0.58" stopColor="#A9D68D" />
            <Stop offset="1" stopColor="#689F38" />
          </LinearGradient>
          <LinearGradient id="buddyEar" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#DCEED2" />
            <Stop offset="1" stopColor="#8BC34A" />
          </LinearGradient>
        </Defs>
        <Ellipse
          cx="80"
          cy="145"
          rx="43"
          ry="7"
          fill="#689F38"
          opacity="0.12"
        />
        <Path
          d="M39 57 C24 25 39 12 57 39 C66 26 94 26 103 39 C121 12 136 25 121 58 C139 77 136 111 119 128 C101 146 58 146 40 128 C23 111 20 77 39 57Z"
          fill="url(#buddyBody)"
        />
        <Path
          d="M42 52 C34 34 40 27 51 43"
          fill="none"
          stroke="#F8F4FF"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.72"
        />
        <Path
          d="M118 52 C126 34 120 27 109 43"
          fill="none"
          stroke="#F8F4FF"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.72"
        />
        {face === "neutral" ? (
          <>
            <Ellipse
              cx="64"
              cy="82"
              rx="5"
              ry={blinking ? 1 : 7}
              fill="#1E2B1A"
            />
            <Ellipse
              cx="96"
              cy="82"
              rx="5"
              ry={blinking ? 1 : 7}
              fill="#1E2B1A"
            />
          </>
        ) : (
          <>
            {/* Happy eyes: closed upward arcs. Blinking is a no-op here —
                the eyes are already shut with joy. */}
            <Path
              d="M59 82 Q64 75 69 82"
              fill="none"
              stroke="#1E2B1A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <Path
              d="M91 82 Q96 75 101 82"
              fill="none"
              stroke="#1E2B1A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {face === "celebrating" ? (
          <Path d="M70 97 Q80 113 90 97 Z" fill="#1E2B1A" />
        ) : face === "happy" ? (
          <Path
            d="M70 98 Q80 109 90 98"
            fill="none"
            stroke="#689F38"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ) : (
          <Path
            d="M72 99 Q80 106 88 99"
            fill="none"
            stroke="#689F38"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        )}
        <Ellipse
          cx="49"
          cy="96"
          rx="8"
          ry="4.5"
          fill="#F5B9D2"
          opacity="0.55"
        />
        <Ellipse
          cx="111"
          cy="96"
          rx="8"
          ry="4.5"
          fill="#F5B9D2"
          opacity="0.55"
        />
        <Circle cx="53" cy="60" r="4" fill="#FFFFFF" opacity="0.8" />
      </Svg>
    </Animated.View>
  );
}
