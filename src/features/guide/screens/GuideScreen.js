// screens/guide/GuideScreen.js
//
// The Reversia Guide, brought back — the companion Daniel had before
// (the scrapped AIGuideModal bottom sheet) as a full screen, in the
// reference's middle-screen layout: a breathing green orb, "How Can I
// Help You Today?", quick chips, and an ask box at the bottom.
//
// It genuinely answers: the local engine (guideService) reads the Food
// Guide, the 7-day meal plan, the user's glucose logs and the Reversal
// Plan — no API key needed. When the guideChat Cloud Function is reachable,
// the same questions are offered to it first, with the local answer as
// the fallback.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { T, FONTS } from "../../../theme/tokens";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { auth } from "../../../config/firebase";
import { getReversalPlan } from "../../reversal/services/reversalService";
import { askGuide, GUIDE_CHIPS } from "../services/guideService";
import { trackEvent } from "../../../utils/analytics";
import PressScale from "../../home/components/PressScale";
import FadeIn from "../../home/components/FadeIn";
import ILLUSTRATIONS from "../../illustrations/illustrations";

const QUICK_ACTIONS = [
  { label: "Today's meals", question: "What should I eat today?" },
  { label: "My sugar", question: "Check my sugar" },
  { label: "My plan", question: "Plan my week" },
];

function Dot({ delay }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withDelay(delay, withTiming(1, { duration: 320 })),
        withTiming(0.3, { duration: 320 })
      ),
      -1
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, style]} />;
}

function ThinkingDots() {
  return (
    <View style={styles.dots}>
      <Dot delay={0} />
      <Dot delay={160} />
      <Dot delay={320} />
    </View>
  );
}

function GuideOrb({ state, compact }) {
  const scale = useSharedValue(1);
  const halo = useSharedValue(1);

  useEffect(() => {
    if (state === "thinking") {
      scale.value = withRepeat(
        withTiming(1.1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      halo.value = withRepeat(
        withTiming(1.14, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else if (state === "landed") {
      scale.value = withSequence(
        withTiming(1.16, { duration: 180 }),
        withSpring(1, { damping: 9, stiffness: 220 })
      );
      halo.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withRepeat(
        withTiming(1.05, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      halo.value = withRepeat(
        withTiming(1.08, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
    return undefined;
  }, [state, scale, halo]);

  const midStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: halo.value }],
  }));

  const size = compact ? 116 : 196;
  const core = compact ? 62 : 104;

  return (
    <View style={[styles.orbWrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.orbHalo,
          haloStyle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      <Animated.View
        style={[
          styles.orbMid,
          midStyle,
          {
            width: size * 0.78,
            height: size * 0.78,
            borderRadius: (size * 0.78) / 2,
          },
        ]}
      >
        <View
          style={[
            styles.orbCore,
            { width: core, height: core, borderRadius: core / 2 },
          ]}
        >
          <Ionicons name="sparkles" size={compact ? 26 : 44} color={T.TEXT} />
        </View>
      </Animated.View>
    </View>
  );
}

export default function GuideScreen({ navigation }) {
  const { colors } = useTheme();
  const { logs } = useUserLogs(50);
  const { userData: profile } = useUserProfile();
  const [plan, setPlan] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [orbState, setOrbState] = useState("idle");
  const [showQuick, setShowQuick] = useState(false);
  const [voted, setVoted] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    let mounted = true;
    getReversalPlan(uid)
      .then((loaded) => {
        if (mounted) setPlan(loaded);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (orbState !== "landed") return undefined;
    const timer = setTimeout(() => setOrbState("idle"), 800);
    return () => clearTimeout(timer);
  }, [orbState]);

  const ask = useCallback(
    async (text) => {
      const question = (text || "").trim();
      if (!question || thinking) return;
      setInput("");
      setShowQuick(false);
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", text: question },
      ]);
      setThinking(true);
      setOrbState("thinking");
      await trackEvent("ai_guide_asked", { question });
      const started = Date.now();
      const result = await askGuide(question, {
        logs,
        plan,
        diagnosis: profile?.diabetesType ?? null,
      });
      const elapsed = Date.now() - started;
      if (elapsed < 600) {
        await new Promise((resolve) => setTimeout(resolve, 600 - elapsed));
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `g-${Date.now()}`,
          role: "guide",
          text: result.text,
          question,
        },
      ]);
      setThinking(false);
      setOrbState("landed");
    },
    [thinking, logs, plan, profile?.diabetesType]
  );

  const handleFeedback = useCallback(async (message, helpful) => {
    setVoted((prev) => ({ ...prev, [message.id]: helpful }));
    await trackEvent("ai_guide_feedback", {
      question: message.question,
      helpful,
    });
  }, []);

  const newConversation = useCallback(() => {
    setMessages([]);
    setVoted({});
    setOrbState("idle");
  }, []);

  const chatting = messages.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={T.BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={T.TEXT} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Ionicons name="sparkles" size={16} color={T.SECONDARY} />
          <Text style={styles.headerTitle}>Reversia Guide</Text>
        </View>
        <TouchableOpacity
          onPress={newConversation}
          style={styles.headerBtn}
          accessibilityLabel="Start a new conversation"
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color={T.TEXT} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {/* Orb + headline */}
          <FadeIn delay={0}>
            <View style={styles.orbSection}>
              <GuideOrb state={orbState} compact={chatting} />
              {!chatting && (
                <Text style={styles.headline}>
                  How Can I Help{"\n"}You Today?
                </Text>
              )}
            </View>
          </FadeIn>

          {/* Conversation thread */}
          {messages.map((message) => (
            <FadeIn key={message.id} delay={0}>
              <View
                style={[
                  styles.bubble,
                  message.role === "user"
                    ? styles.userBubble
                    : styles.guideBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    message.role === "user" && styles.userBubbleText,
                  ]}
                >
                  {message.text}
                </Text>
                {message.role === "guide" && (
                  <View style={styles.feedbackRow}>
                    <Text style={styles.feedbackLabel}>Was this helpful?</Text>
                    <TouchableOpacity
                      onPress={() => handleFeedback(message, true)}
                      style={[
                        styles.feedbackBtn,
                        voted[message.id] === true && styles.feedbackBtnOn,
                      ]}
                      accessibilityLabel="Helpful"
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="thumbs-up"
                        size={15}
                        color={
                          voted[message.id] === true ? T.SECONDARY : T.MUTED
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleFeedback(message, false)}
                      style={[
                        styles.feedbackBtn,
                        voted[message.id] === false && styles.feedbackBtnOn,
                      ]}
                      accessibilityLabel="Not helpful"
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="thumbs-down"
                        size={15}
                        color={
                          voted[message.id] === false ? T.SECONDARY : T.MUTED
                        }
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </FadeIn>
          ))}

          {thinking && (
            <View style={[styles.bubble, styles.guideBubble]}>
              <ThinkingDots />
            </View>
          )}

          {!chatting && !thinking && (
            <FadeIn delay={120}>
              <Text style={styles.hint}>
                Ask about a food, today&apos;s meals, your sugar, or your plan —
                I answer from your own logs and the Food Guide.
              </Text>
            </FadeIn>
          )}

          {/* Sprout companion — small, under the headline area. The
              breathing orb stays the main element. */}
          {!chatting && !thinking && (
            <FadeIn delay={200}>
              <Image
                source={ILLUSTRATIONS["guide-sprout"]}
                style={styles.sproutImage}
                resizeMode="contain"
              />
            </FadeIn>
          )}
        </ScrollView>

        {/* Quick chips */}
        <FadeIn delay={180}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {GUIDE_CHIPS.map((chip) => (
              <PressScale
                key={chip}
                style={styles.chip}
                onPress={() => ask(chip)}
                accessibilityLabel={chip}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </PressScale>
            ))}
          </ScrollView>
        </FadeIn>

        {/* Quick actions (from the + button) */}
        {showQuick && (
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((action) => (
              <PressScale
                key={action.label}
                style={styles.quickBtn}
                onPress={() => ask(action.question)}
                accessibilityLabel={action.label}
              >
                <Text style={styles.quickBtnText}>{action.label}</Text>
              </PressScale>
            ))}
          </View>
        )}

        {/* Ask box */}
        <View style={styles.askBox}>
          <TouchableOpacity
            onPress={() => setShowQuick((prev) => !prev)}
            style={styles.askIconBtn}
            accessibilityLabel="Quick actions"
            activeOpacity={0.7}
          >
            <Ionicons
              name={showQuick ? "close" : "add"}
              size={22}
              color={T.TEXT}
            />
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a question..."
            placeholderTextColor={T.MUTED}
            style={styles.askInput}
            returnKeyType="send"
            onSubmitEditing={() => ask(input)}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("VoiceLog")}
            style={styles.askIconBtn}
            accessibilityLabel="Describe your meal by voice"
            activeOpacity={0.7}
          >
            <Ionicons name="mic-outline" size={21} color={T.TEXT} />
          </TouchableOpacity>
          <PressScale
            style={styles.sendBtn}
            onPress={() => ask(input)}
            accessibilityLabel="Send question"
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </PressScale>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "800",
    color: T.TEXT,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  orbSection: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  orbWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  orbHalo: {
    position: "absolute",
    backgroundColor: "rgba(139,195,74,0.18)",
  },
  orbMid: {
    backgroundColor: T.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  orbCore: {
    backgroundColor: "#C5E1A5",
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    fontFamily: FONTS.display,
    fontSize: 34,
    fontWeight: "800",
    color: T.TEXT,
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -0.6,
    marginTop: 20,
  },
  hint: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: T.MUTED,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 24,
  },
  sproutImage: {
    width: "100%",
    height: 170,
    marginTop: 4,
  },
  bubble: {
    borderRadius: 22,
    padding: 16,
    maxWidth: "88%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCECC9",
    borderBottomRightRadius: 6,
  },
  guideBubble: {
    alignSelf: "flex-start",
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 22,
    color: T.TEXT,
  },
  userBubbleText: {
    color: T.TEXT,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: T.BORDER,
  },
  feedbackLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: T.MUTED,
    flex: 1,
  },
  feedbackBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.PRIMARY_LIGHT,
  },
  feedbackBtnOn: {
    backgroundColor: "#DCECC9",
  },
  dots: {
    flexDirection: "row",
    gap: 5,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.SECONDARY,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  chip: {
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: "600",
    color: T.TEXT,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: T.PRIMARY_LIGHT,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickBtnText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    fontWeight: "700",
    color: T.SECONDARY,
  },
  askBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: T.SURFACE,
    borderWidth: 1,
    borderColor: T.BORDER,
    borderRadius: 999,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 6,
  },
  askIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  askInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: T.TEXT,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: T.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
});
