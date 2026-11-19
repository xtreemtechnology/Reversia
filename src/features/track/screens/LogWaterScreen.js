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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enqueueFailedWrite } from "../../../utils/offlineQueue";
import { T, FONTS } from "../../../theme/tokens";
import FadeIn from "../../home/components/FadeIn";

const GOAL_GLASSES = 8;
const ML_PER_GLASS = 250;
const OFFLINE_LOGS_KEY = "@reversia_offline_logs";

const QUICK_DRINKS = [
  {
    label: "Water",
    icon: "water-outline",
    color: T.SECONDARY,
    bg: "rgba(139,195,74,0.12)",
  },
  {
    label: "Tea",
    icon: "cafe-outline",
    color: T.AMBER,
    bg: "rgba(139,195,74,0.16)",
  },
  {
    label: "Juice",
    icon: "nutrition-outline",
    color: T.PRIMARY,
    bg: "rgba(139,195,74,0.14)",
  },
  {
    label: "Coconut",
    icon: "leaf-outline",
    color: T.SECONDARY,
    bg: "rgba(139,195,74,0.12)",
  },
];

export default function LogWaterScreen({ navigation }) {
  const [glasses, setGlasses] = useState(3);
  const [saving, setSaving] = useState(false);
  const [drinkType, setDrinkType] = useState("water");

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
        drinkType,
        liters: Number((totalMl / 1000).toFixed(2)),
        glasses,
        source: "manual",
        createdAt: serverTimestamp(),
      });
      // Mirror to offline cache
      try {
        const newEntry = {
          category: "hydration",
          drinkType,
          liters: Number((totalMl / 1000).toFixed(2)),
          glasses,
          source: "manual",
          createdAt: new Date().toISOString(),
        };
        const existing = await AsyncStorage.getItem(OFFLINE_LOGS_KEY);
        const cached = existing ? JSON.parse(existing) : [];
        cached.push(newEntry);
        await AsyncStorage.setItem(OFFLINE_LOGS_KEY, JSON.stringify(cached));
      } catch (_) {
        // Don't block UI on offline mirror failure
      }
      navigation?.goBack();
    } catch (error) {
      try {
        await enqueueFailedWrite({
          path: `users/${uid}/logs`,
          data: {
            category: "hydration",
            drinkType,
            liters: Number((totalMl / 1000).toFixed(2)),
            glasses,
            source: "manual",
            date: new Date().toISOString().slice(0, 10),
          },
        });
        Alert.alert(
          "Saved Offline",
          "Your water log was saved locally and will automatically sync once online."
        );
        navigation?.goBack();
      } catch (_) {
        Alert.alert("Could not save", "Please try again in a moment.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.BG} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={T.TEXT} />
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
        <FadeIn delay={0}>
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
                  color={glasses === 0 ? T.BORDER : T.TEXT}
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
                <Ionicons name="add" size={22} color={T.WHITE} />
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
                      color={filled ? T.SECONDARY : T.BORDER}
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
        </FadeIn>

        <FadeIn delay={60}>
          <View style={styles.infoRow}>
            {[
              {
                label: "Daily Goal",
                value: `${GOAL_GLASSES} glasses`,
                icon: "flag-outline",
                color: T.PRIMARY,
              },
              {
                label: "Progress",
                value: `${Math.round(progressPct)}%`,
                icon: "trending-up-outline",
                color: T.SECONDARY,
              },
              {
                label: "Total ml",
                value: `${totalMl} ml`,
                icon: "beaker-outline",
                color: T.AMBER,
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
        </FadeIn>

        <FadeIn delay={120}>
          <Text style={styles.sectionTitle}>What are you drinking?</Text>
          <View style={styles.drinksGrid}>
            {QUICK_DRINKS.map((drink) => {
              const drinkKey = drink.label.toLowerCase().replace(" ", "_");
              const isSelected = drinkType === drinkKey;
              const drinkBorderStyle = {
                borderColor: isSelected ? drink.color : `${drink.color}33`,
              };
              const drinkBadgeStyle = {
                backgroundColor: isSelected ? drink.bg : "transparent",
              };
              return (
                <TouchableOpacity
                  key={drink.label}
                  onPress={() => {
                    setDrinkType(drinkKey);
                    add();
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.drinkCard,
                    drinkBorderStyle,
                    isSelected && { borderWidth: 2 },
                  ]}
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
        </FadeIn>

        <FadeIn delay={180}>
          <View style={styles.reminderBox}>
            <Ionicons
              name="notifications-outline"
              size={16}
              color={T.MUTED}
              style={styles.reminderIcon}
            />
            <Text style={styles.reminderText}>
              Tip: drinking a glass of water first thing in the morning
              jumpstarts hydration.
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={240}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={saveWaterLog}
            disabled={saving}
          >
            <Text style={[styles.saveBtnText, saving && { color: T.MUTED }]}>
              {saving ? "Saving..." : "Save Today's Water Log"}
            </Text>
          </TouchableOpacity>
        </FadeIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.BG,
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
    backgroundColor: T.SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: "700",
    color: T.TEXT,
  },
  headerSub: {
    fontSize: 12,
    color: T.MUTED,
    marginTop: 2,
  },
  counterCard: {
    backgroundColor: T.SURFACE,
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  progressTrack: {
    height: 6,
    backgroundColor: T.PRIMARY_LIGHT,
    borderRadius: 3,
    marginBottom: 28,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: T.SECONDARY,
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
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: T.BORDER,
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterBtnPrimary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  counterDisplay: {
    alignItems: "center",
  },
  counterNum: {
    fontFamily: FONTS.display,
    fontSize: 52,
    fontWeight: "700",
    color: T.TEXT,
    lineHeight: 56,
  },
  counterUnit: {
    fontSize: 14,
    color: T.MUTED,
    marginTop: 2,
  },
  counterMl: {
    fontSize: 12,
    color: T.MUTED,
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
    backgroundColor: T.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  glassDotFilled: {
    backgroundColor: "rgba(139,195,74,0.12)",
    borderColor: T.SECONDARY,
  },
  statusText: {
    fontSize: 13,
    color: T.MUTED,
    textAlign: "center",
  },
  statusTextGoal: {
    color: T.SECONDARY,
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
    backgroundColor: T.SURFACE,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  infoIcon: {
    marginBottom: 6,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: "700",
    color: T.TEXT,
  },
  infoLabel: {
    fontSize: 10,
    color: T.MUTED,
    marginTop: 3,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: T.TEXT,
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
    backgroundColor: T.SURFACE,
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
    color: T.TEXT,
  },
  drinkAmount: {
    fontSize: 11,
    color: T.MUTED,
    marginTop: 3,
  },
  reminderBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: T.SURFACE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: T.BORDER,
  },
  reminderIcon: {
    marginRight: 10,
  },
  reminderText: {
    fontSize: 13,
    color: T.MUTED,
    flex: 1,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: T.PRIMARY,
    borderRadius: 20,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  saveBtnDisabled: {
    backgroundColor: T.PRIMARY_LIGHT,
  },
  saveBtnText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "700",
    color: T.WHITE,
  },
});
