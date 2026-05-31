import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../config/firebase";

const GOAL_GLASSES = 8;
const ML_PER_GLASS = 250;

const QUICK_DRINKS = [
  {
    label: "Water",
    icon: "water-outline",
    color: "#6A816A",
    bg: "rgba(106,129,106,0.15)",
  },
  {
    label: "Tea",
    icon: "cafe-outline",
    color: "#E3B372",
    bg: "rgba(227,179,114,0.15)",
  },
  {
    label: "Juice",
    icon: "nutrition-outline",
    color: "#D88939",
    bg: "rgba(216,137,57,0.15)",
  },
  {
    label: "Coconut",
    icon: "leaf-outline",
    color: "#6A816A",
    bg: "rgba(106,129,106,0.15)",
  },
];

export default function LogWaterScreen({ navigation }) {
  const [glasses, setGlasses] = useState(3);
  const [saving, setSaving] = useState(false);

  const add = () => {
    if (glasses < 12) {
      setGlasses((current) => current + 1);
    }
  };

  const remove = () => {
    if (glasses > 0) {
      setGlasses((current) => current - 1);
    }
  };

  const totalMl = glasses * ML_PER_GLASS;
  const progressPct = Math.min((glasses / GOAL_GLASSES) * 100, 100);
  const remaining = Math.max(GOAL_GLASSES - glasses, 0);
  const goalReached = glasses >= GOAL_GLASSES;
  const glassSlots = Array.from({ length: GOAL_GLASSES });

  const progressFillStyle = useMemo(
    () => ({ width: `${progressPct}%` }),
    [progressPct]
  );

  const saveWaterLog = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid || saving) {
      if (!uid) {
        Alert.alert(
          "Sign in required",
          "Please sign in before saving water logs."
        );
      }
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "users", uid, "logs"), {
        category: "hydration",
        liters: Number((totalMl / 1000).toFixed(2)),
        glasses,
        source: "manual",
        createdAt: serverTimestamp(),
      });
      navigation?.goBack();
    } catch (error) {
      Alert.alert("Could not save", "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#211613" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color="#F4EAE4" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Log Water</Text>
          <Text style={styles.headerSub}>Stay hydrated today</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.counterCard}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, progressFillStyle]} />
          </View>

          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={remove}
              activeOpacity={0.8}
              style={[
                styles.counterBtn,
                glasses === 0 && styles.counterBtnDisabled,
              ]}
              disabled={glasses === 0}
            >
              <Ionicons
                name="remove"
                size={22}
                color={glasses === 0 ? "#402E29" : "#F4EAE4"}
              />
            </TouchableOpacity>

            <View style={styles.counterDisplay}>
              <Text style={styles.counterNum}>{glasses}</Text>
              <Text style={styles.counterUnit}>glasses</Text>
              <Text style={styles.counterMl}>{totalMl} ml</Text>
            </View>

            <TouchableOpacity
              onPress={add}
              activeOpacity={0.8}
              style={styles.counterBtnPrimary}
            >
              <Ionicons name="add" size={22} color="#211613" />
            </TouchableOpacity>
          </View>

          <View style={styles.glassGrid}>
            {glassSlots.map((_, index) => {
              const filled = index < glasses;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setGlasses(index + 1)}
                  activeOpacity={0.8}
                  style={[styles.glassDot, filled && styles.glassDotFilled]}
                >
                  <Ionicons
                    name={filled ? "water" : "water-outline"}
                    size={18}
                    color={filled ? "#6A816A" : "#402E29"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text
            style={[styles.statusText, goalReached && styles.statusTextGoal]}
          >
            {goalReached
              ? "Daily goal reached. Great work."
              : `${remaining} glass${
                  remaining !== 1 ? "es" : ""
                } left to reach your daily goal`}
          </Text>
        </View>

        <View style={styles.infoRow}>
          {[
            {
              label: "Daily Goal",
              value: `${GOAL_GLASSES} glasses`,
              icon: "flag-outline",
              color: "#D88939",
            },
            {
              label: "Progress",
              value: `${Math.round(progressPct)}%`,
              icon: "trending-up-outline",
              color: "#6A816A",
            },
            {
              label: "Total ml",
              value: `${totalMl} ml`,
              icon: "beaker-outline",
              color: "#E3B372",
            },
          ].map((item) => {
            const infoColorStyle = { color: item.color };
            return (
              <View key={item.label} style={styles.infoCard}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.color}
                  style={styles.infoIcon}
                />
                <Text style={[styles.infoVal, infoColorStyle]}>
                  {item.value}
                </Text>
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>What are you drinking?</Text>
        <View style={styles.drinksGrid}>
          {QUICK_DRINKS.map((drink) => {
            const drinkBorderStyle = { borderColor: `${drink.color}33` };
            const drinkBadgeStyle = { backgroundColor: drink.bg };
            return (
              <TouchableOpacity
                key={drink.label}
                onPress={add}
                activeOpacity={0.8}
                style={[styles.drinkCard, drinkBorderStyle]}
              >
                <View style={[styles.drinkIconBadge, drinkBadgeStyle]}>
                  <Ionicons name={drink.icon} size={22} color={drink.color} />
                </View>
                <Text style={styles.drinkLabel}>{drink.label}</Text>
                <Text style={styles.drinkAmount}>250 ml</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.reminderBox}>
          <Ionicons
            name="notifications-outline"
            size={16}
            color="#9A8478"
            style={styles.reminderIcon}
          />
          <Text style={styles.reminderText}>
            Tip: drinking a glass of water first thing in the morning jumpstarts
            hydration.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={saveWaterLog}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save Today's Water Log"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#211613",
  },
  scroll: {
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D201C",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F4EAE4",
  },
  headerSub: {
    fontSize: 12,
    color: "#9A8478",
    marginTop: 2,
  },
  counterCard: {
    backgroundColor: "#2D201C",
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#3A2A25",
    borderRadius: 3,
    marginBottom: 28,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6A816A",
    borderRadius: 3,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  counterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#3A2A25",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.05)",
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterBtnPrimary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D88939",
    alignItems: "center",
    justifyContent: "center",
  },
  counterDisplay: {
    alignItems: "center",
  },
  counterNum: {
    fontSize: 52,
    fontWeight: "700",
    color: "#F4EAE4",
    lineHeight: 56,
  },
  counterUnit: {
    fontSize: 14,
    color: "#9A8478",
    marginTop: 2,
  },
  counterMl: {
    fontSize: 12,
    color: "#9A8478",
    marginTop: 4,
  },
  glassGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  glassDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3A2A25",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  glassDotFilled: {
    backgroundColor: "rgba(106,129,106,0.15)",
    borderColor: "#6A816A",
  },
  statusText: {
    fontSize: 13,
    color: "#9A8478",
    textAlign: "center",
  },
  statusTextGoal: {
    color: "#6A816A",
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#2D201C",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  infoIcon: {
    marginBottom: 6,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F4EAE4",
  },
  infoLabel: {
    fontSize: 10,
    color: "#9A8478",
    marginTop: 3,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F4EAE4",
    paddingHorizontal: 26,
    marginBottom: 14,
  },
  drinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  drinkCard: {
    backgroundColor: "#2D201C",
    width: "47%",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1.5,
  },
  drinkIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  drinkLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F4EAE4",
  },
  drinkAmount: {
    fontSize: 11,
    color: "#9A8478",
    marginTop: 3,
  },
  reminderBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "#2D201C",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  reminderIcon: {
    marginRight: 10,
  },
  reminderText: {
    fontSize: 13,
    color: "#9A8478",
    flex: 1,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: "#D88939",
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  saveBtnDisabled: {
    backgroundColor: "#3A2A25",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#211613",
  },
});
