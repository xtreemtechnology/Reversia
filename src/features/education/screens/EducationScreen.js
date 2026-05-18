import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useTheme } from "../../../theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";

export default function EducationScreen() {
  const { colors } = useTheme();
  const isDark = colors.background !== "#FFFFFF";
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Academy");
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark);

  const lessons = [
    {
      id: 1,
      title: "The Insulin 'Lock' Concept",
      duration: "3 min read",
      category: "Fundamentals",
      status: "Completed",
      color: "#22422F",
      icon: "key-variant",
    },
    {
      id: 2,
      title: "Why Walk After Eating?",
      duration: "5 min read",
      category: "Lifestyle",
      status: "Up Next",
      color: "#10B981",
      icon: "run-fast",
    },
    {
      id: 3,
      title: "Fiber: Your Glucose Shield",
      duration: "4 min read",
      category: "Nutrition",
      status: "Locked",
      color: "#ECA143",
      icon: "shield-check",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={styles.screen}>
        <View style={[styles.topPadding, { paddingTop: insets.top + 6 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackBtn}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.flexSpacer} />
          </View>
        </View>

        <View style={styles.tabContainer}>
          {["Academy", "Community"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "Academy" ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Reversal Academy</Text>
                <Text style={styles.subtitle}>
                  Master your metabolism, one lesson at a time.
                </Text>
              </View>

              <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
                <ImageBackground
                  source={{
                    uri: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=500",
                  }}
                  style={styles.featuredImage}
                  imageStyle={styles.featuredImageRadius}
                >
                  <View style={styles.overlay}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>MASTERCLASS</Text>
                    </View>
                    <Text style={styles.featuredTitle}>
                      The 12-Week Reversal Blueprint
                    </Text>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBarBg}>
                        <View style={styles.progressBarFill35} />
                      </View>
                      <Text style={styles.progressText}>35% Done</Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Daily Lessons</Text>
              {lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    lesson.status === "Locked" && styles.lockedCard,
                  ]}
                  disabled={lesson.status === "Locked"}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: lesson.color + "15" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={lesson.status === "Locked" ? "lock" : lesson.icon}
                      size={24}
                      color={
                        lesson.status === "Locked" ? "#9CA3AF" : lesson.color
                      }
                    />
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonCategory}>{lesson.category}</Text>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.metaText}>{lesson.duration}</Text>
                      {lesson.status === "Completed" && (
                        <View style={styles.completedBadge}>
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#10B981"
                          />
                          <Text style={styles.completedText}>Done</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {lesson.status !== "Locked" && (
                    <Ionicons
                      name="play-circle"
                      size={32}
                      color={lesson.color}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Support Hub</Text>
                <Text style={styles.subtitle}>
                  Get expert answers and find community motivation.
                </Text>
              </View>

              <View style={styles.expertInputBox}>
                <TextInput
                  placeholder="Ask a question..."
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity style={styles.sendBtn}>
                  <Ionicons name="send" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Success Stories</Text>
              <View style={styles.postCard}>
                <View style={styles.postUserRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>JO</Text>
                  </View>
                  <View>
                    <Text style={styles.postUser}>James O.</Text>
                    <Text style={styles.postTime}>Verified • Reversed</Text>
                  </View>
                </View>
                <Text style={styles.postText}>
                  "My HbA1c dropped from 7.2 to 5.8 in 4 months. The Post-Meal
                  Walk is real!"
                </Text>
                <View style={styles.postStats}>
                  <Ionicons name="heart" size={16} color="#EF4444" />
                  <Text style={styles.statText}>124</Text>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#6B7280"
                    style={styles.postStatsIcon}
                  />
                  <Text style={styles.statText}>18</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.supportCard}>
                <View style={styles.supportIconBg}>
                  <MaterialCommunityIcons
                    name="doctor"
                    size={28}
                    color="#825CFF"
                  />
                </View>
                <View style={styles.supportContent}>
                  <Text style={styles.supportTitle}>Talk to a Specialist</Text>
                  <Text style={styles.supportDesc}>
                    Direct access to metabolic health coaches.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1 },
    topPadding: { paddingHorizontal: 20 },
    flexSpacer: { flex: 1 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    headerBackBtn: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    tabContainer: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 4,
      padding: 6,
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      marginRight: 8,
      borderRadius: 14,
    },
    activeTab: {
      backgroundColor: isDark ? "rgba(130,92,255,0.16)" : "#F3E8FF",
    },
    tabText: { fontSize: 14, fontWeight: "700", color: colors.muted },
    activeTabText: { color: colors.primary },
    content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 112 },
    header: { marginBottom: 20 },
    title: {
      fontSize: 30,
      fontWeight: "800",
      color: colors.text,
      lineHeight: 34,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      lineHeight: 21,
      marginTop: 6,
    },
    featuredCard: {
      height: 224,
      marginBottom: 24,
      elevation: 4,
      shadowColor: colors.text,
      shadowOpacity: 0.11,
      shadowRadius: 14,
      overflow: "hidden",
      borderRadius: 28,
    },
    featuredImage: { flex: 1, justifyContent: "flex-end" },
    featuredImageRadius: { borderRadius: 28 },
    overlay: {
      backgroundColor: "rgba(0,0,0,0.35)",
      padding: 22,
      borderRadius: 28,
      height: "100%",
      justifyContent: "flex-end",
    },
    featuredBadge: {
      backgroundColor: colors.primary,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      marginBottom: 10,
    },
    featuredBadgeText: {
      color: colors.background,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    featuredTitle: {
      color: "#FFF",
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 14,
      lineHeight: 30,
    },
    progressRow: { flexDirection: "row", alignItems: "center" },
    progressBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: "rgba(255,255,255,0.3)",
      borderRadius: 4,
      marginRight: 12,
    },
    progressBarFill: {
      height: 8,
      backgroundColor: "#FFF",
      borderRadius: 4,
    },
    progressBarFill35: {
      height: 8,
      width: "35%",
      backgroundColor: "#FFF",
      borderRadius: 4,
    },
    progressText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
    sectionTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 14,
      marginTop: 8,
    },
    lessonCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 17,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    lockedCard: { opacity: 0.6 },
    iconBox: {
      width: 52,
      height: 52,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    lessonInfo: { flex: 1 },
    lessonCategory: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    lessonTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginVertical: 3,
      lineHeight: 22,
    },
    metaRow: { flexDirection: "row", alignItems: "center" },
    metaText: {
      fontSize: 12,
      color: colors.muted,
      marginLeft: 4,
      marginRight: 10,
    },
    completedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#0F2F24" : "#ECFDF5",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },
    completedText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#10B981",
      marginLeft: 2,
    },
    expertInputBox: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    input: { flex: 1, paddingHorizontal: 12, fontSize: 15, color: colors.text },
    sendBtn: {
      backgroundColor: colors.primary,
      width: 46,
      height: 46,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    postCard: {
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 18,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    postUserRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#3E3B5C" : "#F3F4FF",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    avatarText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
    postUser: { fontSize: 14, fontWeight: "700", color: colors.text },
    postTime: { fontSize: 11, color: "#10B981", fontWeight: "600" },
    postText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 12,
    },
    postStats: { flexDirection: "row", alignItems: "center" },
    postStatsIcon: { marginLeft: 15 },
    statText: { fontSize: 12, color: colors.muted, marginLeft: 4 },
    supportCard: {
      backgroundColor: isDark ? "#263248" : "#F8FAFF",
      borderRadius: 26,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      borderWidth: 1,
      borderColor: colors.border,
    },
    supportIconBg: {
      width: 52,
      height: 52,
      borderRadius: 18,
      backgroundColor: isDark ? "#3E3B5C" : "#F5F3FF",
      justifyContent: "center",
      alignItems: "center",
    },
    supportContent: { marginLeft: 15, flex: 1 },
    supportTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
    supportDesc: { fontSize: 13, color: colors.muted, marginTop: 2 },
  });
