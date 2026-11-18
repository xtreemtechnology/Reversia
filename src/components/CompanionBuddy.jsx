import React from "react";
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
 */
export default function CompanionBuddy({ size = 116 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" accessibilityLabel="Reversia companion">
      <Defs>
        <LinearGradient id="buddyBody" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E9E0FF" />
          <Stop offset="0.58" stopColor="#BDA7FF" />
          <Stop offset="1" stopColor="#9270EA" />
        </LinearGradient>
        <LinearGradient id="buddyEar" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#DCD0FF" />
          <Stop offset="1" stopColor="#A78BFA" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="80" cy="145" rx="43" ry="7" fill="#8055E8" opacity="0.12" />
      <Path d="M39 57 C24 25 39 12 57 39 C66 26 94 26 103 39 C121 12 136 25 121 58 C139 77 136 111 119 128 C101 146 58 146 40 128 C23 111 20 77 39 57Z" fill="url(#buddyBody)" />
      <Path d="M42 52 C34 34 40 27 51 43" fill="none" stroke="#F8F4FF" strokeWidth="5" strokeLinecap="round" opacity="0.72" />
      <Path d="M118 52 C126 34 120 27 109 43" fill="none" stroke="#F8F4FF" strokeWidth="5" strokeLinecap="round" opacity="0.72" />
      <Ellipse cx="64" cy="82" rx="5" ry="7" fill="#403454" />
      <Ellipse cx="96" cy="82" rx="5" ry="7" fill="#403454" />
      <Path d="M72 99 Q80 106 88 99" fill="none" stroke="#6D55B5" strokeWidth="3.5" strokeLinecap="round" />
      <Ellipse cx="49" cy="96" rx="8" ry="4.5" fill="#F5B9D2" opacity="0.55" />
      <Ellipse cx="111" cy="96" rx="8" ry="4.5" fill="#F5B9D2" opacity="0.55" />
      <Circle cx="53" cy="60" r="4" fill="#FFFFFF" opacity="0.8" />
    </Svg>
  );
}
