import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import AnimatedScreen from "../../../components/AnimatedScreen";
import { useTheme } from "../../../theme/ThemeProvider";
import { auth, db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
/* eslint-disable react-native/no-inline-styles */

export default function WaterEntryScreen({ navigation }) {
  const { colors } = useTheme();
  const [glasses, setGlasses] = useState(4);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const styles = getStyles(colors);

  const handleSaveWater = async () => {
    setMessage(null);
    if (glasses === 0) {
      setMessage("Please log at least one glass of water.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const logsRef = collection(db, "users", user.uid, "logs");

        await addDoc(logsRef, {
          type: "water",
          value: glasses,
          unit: glasses === 1 ? "glass" : "glasses",
          period: "Hydration",
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
        });

        navigation.goBack();
      }
    } catch (error) {
      console.error("Water Save Error:", error);
      setMessage("We couldn't save your progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedScreen style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hydration</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.counterSection}>
            <MaterialCommunityIcons
              name="water"
              size={100}
              color={colors.primary}
            />
            <Text style={styles.waterCount}>
              {glasses}{" "}
              <Text style={styles.waterSub}>
                {glasses === 1 ? "Glass" : "Glasses"}
              </Text>
            </Text>

            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => setGlasses(Math.max(0, glasses - 1))}
                style={[
                  styles.roundBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons name="remove" size={30} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setGlasses(glasses + 1)}
                style={[styles.roundBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.finishBtn,
              { backgroundColor: colors.primary },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSaveWater}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.finishText}>Save Progress</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.hintText, { color: colors.muted }]}>
            Logging {glasses} glasses will contribute to your daily hydration
            goal.
          </Text>

          {message && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
        </View>
      </AnimatedScreen>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1 },
    content: {
      padding: 24,
      flex: 1,
      justifyContent: "center",
      paddingBottom: 110,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      position: "absolute",
      top: 50,
      left: 24,
      right: 24,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    headerSpacer: { width: 28 },
    counterSection: { alignItems: "center", marginBottom: 40 },
    waterCount: {
      fontSize: 48,
      fontWeight: "800",
      color: colors.primary,
      marginTop: 12,
    },
    waterSub: { fontSize: 18, fontWeight: "600", color: colors.primary },
    controls: { flexDirection: "row", marginTop: 30, gap: 24 },
    roundBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    finishBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      elevation: 3,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    finishText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
    hintText: {
      textAlign: "center",
      color: colors.muted,
      fontSize: 13,
      marginTop: 20,
      lineHeight: 18,
    },
    messageBox: {
      backgroundColor: "#FEE2E2",
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
  });
