import React from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

const MOOD_COLORS = {
  great: ["#FFF0C7", "#F5C66B"],
  good: ["#E7F5D8", "#A9D68D"],
  okay: ["#EDE7FF", "#C7B8F5"],
  low: ["#E5EDFF", "#A9BCEB"],
  rough: ["#FCE5EE", "#E9AFC8"],
};

export default function MoodFace({ mood = "okay", size = 44, selected = false }) {
  const [start, end] = MOOD_COLORS[mood] || MOOD_COLORS.okay;
  const mouth = {
    great: "M35 39 Q50 56 65 39",
    good: "M38 43 Q50 53 62 43",
    okay: "M40 47 L60 47",
    low: "M38 52 Q50 40 62 52",
    rough: "M35 54 Q50 38 65 54",
  }[mood] || "M40 47 L60 47";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={`${mood} mood`}>
      <Defs>
        <LinearGradient id={`mood-${mood}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={start} />
          <Stop offset="1" stopColor={end} />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="50" r="46" fill={`url(#mood-${mood})`} stroke={selected ? "#8055E8" : "#FFFFFF"} strokeWidth={selected ? 4 : 2} />
      <Circle cx="36" cy="39" r="4.2" fill="#403454" />
      <Circle cx="64" cy="39" r="4.2" fill="#403454" />
      <Path d={mouth} fill="none" stroke="#403454" strokeWidth="4.5" strokeLinecap="round" />
      {(mood === "great" || mood === "good") && (
        <>
          <Circle cx="25" cy="52" r="5" fill="#EF9BB5" opacity="0.55" />
          <Circle cx="75" cy="52" r="5" fill="#EF9BB5" opacity="0.55" />
        </>
      )}
      {mood === "rough" && (
        <>
          <Path d="M29 28 L40 32" stroke="#403454" strokeWidth="3" strokeLinecap="round" />
          <Path d="M60 32 L71 28" stroke="#403454" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
