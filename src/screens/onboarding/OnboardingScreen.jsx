import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "../../theme/tokens";
import ILLUSTRATIONS from "../../features/illustrations/illustrations";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const Dim = Dimensions;
const SW = Dim.get("window").width;

// Local color tokens (kept inline to stay self-contained)
const C = {
  background: "#689F38",
  primary: "#AED581",
  secondary: "#EFF6E4",
  foreground: "#FFFFFF",
  muted: "#4E7A2E",
  mutedFg: "#EFF6E4",
  card: "rgba(255,255,255,0.16)",
};

const SLIDES = [
  {
    id: "understand",
    tag: "01 — UNDERSTAND",
    headline: "Your body\nhas a pattern.",
    body: "Reversia reads the signals your daily habits create — food, sleep, movement — and surfaces what your body is actually telling you.",
    accentColor: "#FFFFFF",
    iconName: "pulse",
    art: "onboard-understand",
  },
  {
    id: "local",
    tag: "02 — LOCAL INTELLIGENCE",
    headline: "Built for\nhow you eat.",
    body: "From garri to ogbono, jollof to egusi — Reversia recognises the foods you grew up with and gives you insights grounded in your reality.",
    accentColor: "#DCEED2",
    iconName: "restaurant",
    art: "onboard-local",
  },
  {
    id: "reverse",
    tag: "03 — REVERSE",
    headline: "Small shifts.\nReal change.",
    body: "Prediabetes and Type 2 diabetes can be reversed. Reversia shows you exactly which habits are moving the needle — and which ones aren't.",
    accentColor: "#F2CC8F",
    iconName: "trending-up",
    art: "onboard-reverse",
  },
  {
    id: "ready",
    tag: "04 — START",
    headline: "Ready when\nyou are.",
    body: "No complicated setup. No jargon. Just log your day, and let Reversia do the rest. Your first insight is waiting.",
    accentColor: "#FFFFFF",
    iconName: "sparkles",
    art: "welcome-hero",
    isFinal: true,
  },
];

function Dots({ total, active, activeColor }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i === active
              ? [
                  dotStyles.dotActive,
                  { backgroundColor: activeColor, width: 24 },
                ]
              : { backgroundColor: C.muted },
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { height: 6, width: 6, borderRadius: 3 },
  dotActive: { height: 6, borderRadius: 3 },
});

function Slide({ slide, index, isActive }) {
  const opacity = useSharedValue(isActive ? 1 : 0);
  const translateX = useSharedValue(isActive ? 0 : 40);

  React.useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      translateX.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateX.value = withTiming(-30, { duration: 200 });
    }
  }, [isActive, opacity, translateX]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[slideStyles.slide, animStyle]}>
      <Text style={[slideStyles.tag, { color: slide.accentColor }]}>
        {slide.tag}
      </Text>
      {slide.art && (
        <View style={slideStyles.heroCard}>
          <Image
            source={ILLUSTRATIONS[slide.art]}
            style={slideStyles.heroImage}
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={slideStyles.headline}>{slide.headline}</Text>
      <Text style={slideStyles.body}>{slide.body}</Text>
    </Animated.View>
  );
}

const slideStyles = StyleSheet.create({
  slide: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 32,
    paddingTop: 28,
    justifyContent: "center",
  },
  tag: {
    fontSize: 11,
    fontFamily: FONTS.display,
    letterSpacing: 1.5,
    marginBottom: 16,
    fontWeight: "600",
  },
  headline: {
    fontSize: 42,
    fontFamily: FONTS.display,
    color: C.foreground,
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 28,
  },
  // Every slide's illustration sits in the same white card, because
  // the slides live on a green gradient — the drawings' own white
  // backgrounds would not blend with it the way they do on the sage
  // screens. Same card, same 200pt height on all four slides.
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    height: 200,
    marginBottom: 20,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  body: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: C.mutedFg,
    lineHeight: 26,
    maxWidth: SW - 80,
  },
});

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const progressAnim = useSharedValue(0);

  const slide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  useEffect(() => {
    progressAnim.value = withTiming((currentIndex + 1) / SLIDES.length, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentIndex, progressAnim]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const goNext = () => {
    if (isLast) onFinish?.();
    else setCurrentIndex((i) => i + 1);
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  return (
    <LinearGradient
      colors={["#AED581", "#8BC34A", "#689F38"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={obStyles.root}
    >
      <StatusBar barStyle="light-content" />
      <View style={obStyles.progressTrack}>
        <Animated.View
          style={[
            obStyles.progressFill,
            { backgroundColor: slide.accentColor },
            progressStyle,
          ]}
        />
      </View>

      <View style={obStyles.topNav}>
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.6}
          style={[obStyles.navBtn, { opacity: currentIndex === 0 ? 0 : 1 }]}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color={C.mutedFg} />
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity onPress={onFinish} activeOpacity={0.6}>
            <Text style={obStyles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={obStyles.slideArea}>
        {SLIDES.map((s, i) => (
          <Slide key={s.id} slide={s} index={i} isActive={i === currentIndex} />
        ))}
      </View>

      <View style={obStyles.bottom}>
        <Dots
          total={SLIDES.length}
          active={currentIndex}
          activeColor={slide.accentColor}
        />

        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.85}
          style={[obStyles.cta, { backgroundColor: "#1E2B1A" }]}
        >
          <Text style={obStyles.ctaText}>
            {isLast ? "Get Started" : "Continue"}
          </Text>
          <Ionicons
            name={isLast ? "arrow-forward" : "arrow-forward"}
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View
        style={[
          obStyles.cornerAccent,
          { borderColor: slide.accentColor + "20" },
        ]}
      />
    </LinearGradient>
  );
}

const obStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
  },
  progressTrack: {
    height: 2,
    backgroundColor: C.muted,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  progressFill: { height: "100%", borderRadius: 1 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 8,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontSize: 14,
    color: C.mutedFg,
    fontFamily: FONTS.body,
    fontWeight: "500",
  },
  slideArea: { flex: 1, position: "relative" },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: "600",
  },
  cornerAccent: {
    position: "absolute",
    bottom: 80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    opacity: 0.5,
  },
});
