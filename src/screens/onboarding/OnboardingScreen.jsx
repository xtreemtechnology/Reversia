import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";

const Dim = Dimensions;
const SW = Dim.get("window").width;
const SH = Dim.get("window").height;

// Local color tokens (kept inline to stay self-contained)
const C = {
  background: "#231F1C",
  primary: "#E07A5F",
  secondary: "#798C73",
  foreground: "#F5F5F4",
  muted: "#3E3835",
  mutedFg: "#A8A29E",
  card: "#2D2825",
};

const SLIDES = [
  {
    id: "understand",
    tag: "01 — UNDERSTAND",
    headline: "Your body\nhas a pattern.",
    body:
      "Reversia reads the signals your daily habits create — food, sleep, movement — and surfaces what your body is actually telling you.",
    accentColor: C.primary,
    iconName: "pulse",
    visual: "waveform",
  },
  {
    id: "local",
    tag: "02 — LOCAL INTELLIGENCE",
    headline: "Built for\nhow you eat.",
    body:
      "From garri to ogbono, jollof to egusi — Reversia recognises the foods you grew up with and gives you insights grounded in your reality.",
    accentColor: C.secondary,
    iconName: "restaurant",
    visual: "grid",
  },
  {
    id: "reverse",
    tag: "03 — REVERSE",
    headline: "Small shifts.\nReal change.",
    body:
      "Prediabetes and Type 2 diabetes can be reversed. Reversia shows you exactly which habits are moving the needle — and which ones aren't.",
    accentColor: "#F2CC8F",
    iconName: "trending-up",
    visual: "bars",
  },
  {
    id: "ready",
    tag: "04 — START",
    headline: "Ready when\nyou are.",
    body:
      "No complicated setup. No jargon. Just log your day, and let Reversia do the rest. Your first insight is waiting.",
    accentColor: C.primary,
    iconName: "sparkles",
    visual: "none",
    isFinal: true,
  },
];

function SlideVisual({ type, color }) {
  if (type === "waveform") {
    const bars = [0.3, 0.5, 0.7, 0.9, 0.75, 0.55, 0.85, 0.65, 0.45, 0.6, 0.8, 0.5];
    return (
      <View style={visualStyles.waveContainer}>
        {bars.map((h, i) => (
          <View
            key={i}
            style={[
              visualStyles.waveBar,
              {
                height: 80 * h,
                backgroundColor: i === 8 ? color : color + "40",
                marginHorizontal: 3,
              },
            ]}
          />
        ))}
        <View style={[visualStyles.waveLine, { backgroundColor: color + "30" }]} />
      </View>
    );
  }

  if (type === "grid") {
    const tiles = [
      { label: "Garri", color: "#F2CC8F" },
      { label: "Rice", color: C.primary },
      { label: "Ogbono", color: C.secondary },
      { label: "Amala", color: "#A8A29E" },
      { label: "Ewedu", color: "#81B29A" },
      { label: "Beans", color: "#E28A82" },
    ];
    return (
      <View style={visualStyles.gridWrap}>
        {tiles.map((t, i) => (
          <View
            key={i}
            style={[visualStyles.gridTile, { backgroundColor: t.color + "22", borderColor: t.color + "40" }]}
          >
            <Text style={[visualStyles.gridTileText, { color: t.color }]}>{t.label}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (type === "bars") {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const heights = [0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.65];
    return (
      <View style={visualStyles.barsWrap}>
        {days.map((d, i) => (
          <View key={i} style={visualStyles.barCol}>
            <View style={visualStyles.barTrack}>
              <View
                style={[
                  visualStyles.barFill,
                  { height: `${heights[i] * 100}%`, backgroundColor: i === 5 ? color : color + "55" },
                ]}
              />
            </View>
            <Text style={[visualStyles.barDay, { color: C.mutedFg }]}>{d}</Text>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

const visualStyles = StyleSheet.create({
  waveContainer: { flexDirection: "row", alignItems: "flex-end", height: 90, position: "relative", paddingBottom: 2 },
  waveBar: { width: 14, borderRadius: 7 },
  waveLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 1 },
  gridWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  gridTile: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  gridTileText: { fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold", fontWeight: "600" },
  barsWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 90 },
  barCol: { alignItems: "center", gap: 6, flex: 1 },
  barTrack: { flex: 1, width: "100%", backgroundColor: C.muted, borderRadius: 8, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 8 },
  barDay: { fontSize: 11, fontFamily: "DMSans_400Regular" },
});

function Dots({ total, active, activeColor }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i === active ? [dotStyles.dotActive, { backgroundColor: activeColor, width: 24 }] : { backgroundColor: C.muted },
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 6 }, dot: { height: 6, width: 6, borderRadius: 3 }, dotActive: { height: 6, borderRadius: 3 } });

function Slide({ slide, index, isActive }) {
  const opacity = useSharedValue(isActive ? 1 : 0);
  const translateX = useSharedValue(isActive ? 0 : 40);

  React.useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
      translateX.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateX.value = withTiming(-30, { duration: 200 });
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateX: translateX.value }] }));

  return (
    <Animated.View style={[slideStyles.slide, animStyle]}>
      <Text style={[slideStyles.tag, { color: slide.accentColor }]}>{slide.tag}</Text>
      <Text style={slideStyles.headline}>{slide.headline}</Text>
      {slide.visual !== "none" && (
        <View style={slideStyles.visualWrap}>
          <SlideVisual type={slide.visual} color={slide.accentColor} />
        </View>
      )}
      <Text style={slideStyles.body}>{slide.body}</Text>
    </Animated.View>
  );
}

const slideStyles = StyleSheet.create({
  slide: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 32, paddingTop: 28, justifyContent: "center" },
  tag: { fontSize: 11, fontFamily: "DMSans_500Medium", letterSpacing: 1.5, marginBottom: 16, fontWeight: "600" },
  headline: { fontSize: 42, fontFamily: "PlusJakartaSans_700Bold", color: C.foreground, lineHeight: 50, letterSpacing: -1, marginBottom: 28 },
  visualWrap: { marginBottom: 32, paddingLeft: 2 },
  body: { fontSize: 16, fontFamily: "DMSans_400Regular", color: C.mutedFg, lineHeight: 26, maxWidth: SW - 80 },
});

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const progressAnim = useSharedValue(0);

  const slide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  useEffect(() => {
    progressAnim.value = withTiming((currentIndex + 1) / SLIDES.length, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [currentIndex]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${progressAnim.value * 100}%` }));

  const goNext = () => {
    if (isLast) onFinish?.();
    else setCurrentIndex((i) => i + 1);
  };

  const goBack = () => { if (currentIndex > 0) setCurrentIndex((i) => i - 1); };

  return (
    <View style={obStyles.root}>
      <StatusBar barStyle="light-content" />
      <View style={obStyles.progressTrack}>
        <Animated.View style={[obStyles.progressFill, { backgroundColor: slide.accentColor }, progressStyle]} />
      </View>

      <View style={obStyles.topNav}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.6} style={[obStyles.navBtn, { opacity: currentIndex === 0 ? 0 : 1 }]} disabled={currentIndex === 0}>
          <Ionicons name="chevron-back" size={20} color={C.mutedFg} />
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity onPress={onFinish} activeOpacity={0.6}><Text style={obStyles.skipText}>Skip</Text></TouchableOpacity>
        )}
      </View>

      <View style={obStyles.slideArea}>{SLIDES.map((s, i) => (<Slide key={s.id} slide={s} index={i} isActive={i === currentIndex} />))}</View>

      <View style={obStyles.bottom}>
        <Dots total={SLIDES.length} active={currentIndex} activeColor={slide.accentColor} />

        <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={[obStyles.cta, { backgroundColor: slide.accentColor }]}>
          <Text style={obStyles.ctaText}>{isLast ? "Get Started" : "Continue"}</Text>
          <Ionicons name={isLast ? "arrow-forward" : "arrow-forward"} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[obStyles.cornerAccent, { borderColor: slide.accentColor + "20" }]} />
    </View>
  );
}

const obStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background, paddingBottom: Platform.OS === "ios" ? 44 : 28 },
  progressTrack: { height: 2, backgroundColor: C.muted, position: "absolute", top: 0, left: 0, right: 0 },
  progressFill: { height: "100%", borderRadius: 1 },
  topNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 8 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 14, color: C.mutedFg, fontFamily: "DMSans_400Regular", fontWeight: "500" },
  slideArea: { flex: 1, position: "relative" },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 32, paddingTop: 20 },
  cta: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 999 },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontFamily: "PlusJakartaSans_600SemiBold", fontWeight: "600" },
  cornerAccent: { position: "absolute", bottom: 80, right: -60, width: 200, height: 200, borderRadius: 100, borderWidth: 1, opacity: 0.5 },
});
