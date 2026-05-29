import React, { useEffect, useState } from "react";
import { Modal, SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import { trackEvent } from "../../../utils/analytics";

async function fetchAIResponse(question) {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!key) {
    // fallback canned response
    return `Here's a short suggestion: balance the plate with protein and fiber, reduce refined carbs portion, and add a 10–15 minute walk after the meal.`;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Reversia: provide concise, culturally-aware meal guidance for Nigerian foods. Keep answers short and actionable." },
          { role: "user", content: question },
        ],
        max_tokens: 250,
        temperature: 0.6,
      }),
    });

    const json = await res.json();
    return json?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response right now.";
  } catch (err) {
    console.warn("AI fetch failed", err);
    return "Sorry, I couldn't generate a response right now.";
  }
}

export default function AIGuideModal({ visible, question, onClose }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!visible) return;

    const run = async () => {
      setLoading(true);
      setResponse(null);
      await trackEvent("ai_guide_asked", { question });
      const r = await fetchAIResponse(question);
      if (!mounted) return;
      setResponse(r);
      setLoading(false);
    };

    run();
    return () => {
      mounted = false;
    };
  }, [visible, question]);

  const handleFeedback = async (helpful) => {
    await trackEvent("ai_guide_feedback", { question, helpful });
    onClose?.();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border + "80" }]}> 
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>Reversia Guide</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>Q: {question}</Text>
            <View style={styles.responseWrap}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Text style={[styles.responseText, { color: colors.foreground }]}>{response}</Text>
              )}
            </View>

            <View style={styles.feedbackRow}>
              <TouchableOpacity style={[styles.feedbackBtn, { borderColor: colors.border }]} onPress={() => handleFeedback(true)}>
                <Ionicons name="thumbs-up" size={18} color={colors.primary} />
                <Text style={[styles.feedbackText, { color: colors.primary }]}>Helpful</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.feedbackBtn, { borderColor: colors.border }]} onPress={() => handleFeedback(false)}>
                <Ionicons name="thumbs-down" size={18} color={colors.mutedForeground} />
                <Text style={[styles.feedbackText, { color: colors.mutedForeground }]}>Not helpful</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: "88%", borderWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "700" },
  closeBtn: { padding: 8 },
  content: { gap: 14, paddingTop: 10 },
  subTitle: { fontSize: 13, fontWeight: "600" },
  responseWrap: { minHeight: 120, justifyContent: "center" },
  responseText: { fontSize: 15, lineHeight: 22 },
  feedbackRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  feedbackBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  feedbackText: { fontSize: 14, fontWeight: "600" },
});
