import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useTheme } from "../theme/ThemeProvider";

export default function BMICalculator({
  navigation,
  showHeader = true,
  onSaved,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("175");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState({ label: "-", color: colors.muted });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;

    if (w > 0 && h > 0) {
      const score = (w / (h * h)).toFixed(1);
      setBmi(score);

      if (score < 18.5) {
        setCategory({ label: "Underweight", color: "#3B82F6" });
      } else if (score < 25) {
        setCategory({ label: "Healthy Weight", color: "#10B981" });
      } else if (score < 30) {
        setCategory({ label: "Overweight", color: "#F59E0B" });
      } else {
        setCategory({ label: "Obese", color: "#EF4444" });
      }
    } else {
      setBmi(null);
      setCategory({ label: "-", color: colors.muted });
    }
  }, [weight, height, colors.muted]);

  const handleSaveBMI = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be signed in to update your profile.");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        latestBMI: bmi,
        weight,
        height,
        bmiCategory: category.label,
        lastUpdated: serverTimestamp(),
      });

      if (typeof onSaved === "function") {
        onSaved({ bmi, weight, height, category: category.label });
      } else {
        setMessage("Your health metrics have been updated.");
      }

      if (navigation?.canGoBack?.()) {
        navigation.goBack();
      }
    } catch (error) {
      setMessage("Could not save metrics.");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.resultContainer}>
        <Text style={styles.bmiValue}>{bmi || "--"}</Text>
        <Text style={[styles.categoryLabel, { color: category.color }]}>
          {category.label}
        </Text>
        <Text style={styles.bmiSubtext}>Body Mass Index</Text>
      </View>

      <View style={styles.inputCard}>
        <View style={styles.inputGroup}>
          <MaterialCommunityIcons
            name="weight-kilogram"
            size={24}
            color={colors.primary}
          />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <View
          style={[
            styles.inputGroup,
            {
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              paddingTop: 20,
              marginTop: 20,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="human-male-height"
            size={24}
            color={colors.primary}
          />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Glucose Connection</Text>
        <Text style={styles.infoText}>
          A healthy BMI improves insulin sensitivity. Higher body fat can make
          it harder for your cells to respond to insulin, leading to higher
          glucose spikes.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && { opacity: 0.7 }]}
        onPress={handleSaveBMI}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.saveText}>Update Profile</Text>
        )}
      </TouchableOpacity>

      {message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}
    </ScrollView>
  );

  if (!showHeader) {
    return content;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Composition</Text>
        <View style={{ width: 24 }} />
      </View>
      {content}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.card,
    },
    headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
    content: { padding: 20 },
    resultContainer: {
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 40,
      alignItems: "center",
      marginBottom: 20,
      ...shadowStyle({ offsetY: 6, opacity: 0.08, radius: 12, elevation: 2 }),
    },
    bmiValue: { fontSize: 64, fontWeight: "900", color: colors.text },
    categoryLabel: { fontSize: 18, fontWeight: "800", marginBottom: 5 },
    bmiSubtext: { fontSize: 14, color: colors.muted, fontWeight: "600" },
    inputCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
    },
    inputGroup: { flexDirection: "row", alignItems: "center" },
    inputLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.muted,
      textTransform: "uppercase",
    },
    textInput: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      marginTop: 5,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 30,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.primary,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      opacity: 0.8,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
    },
    saveText: { color: colors.background, fontSize: 16, fontWeight: "800" },
    messageBox: {
      backgroundColor: "#FEE2E2",
      borderRadius: 14,
      padding: 12,
      marginTop: 14,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
  });
