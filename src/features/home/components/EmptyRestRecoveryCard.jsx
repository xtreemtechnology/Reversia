import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function EmptyRestRecoveryCard() {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <View style={[styles.glowBlob, { backgroundColor: colors.secondary + "24" }]} />
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.secondary + "22" }]}>
          <Ionicons name="moon" size={22} color={colors.secondary} />
        </View>
        <View style={styles.textGroup}>
          <Text style={[styles.title, { color: colors.text }]}>Rest & Recovery</Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>Log your sleep tonight and Reversia will show you how rest shapes your energy and glucose stability.</Text>
          <View style={[styles.placeholder, { borderColor: colors.secondary + "44" }]}>
            <Text style={[styles.placeholderText, { color: colors.secondary }]}>No sleep logged yet</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  glowBlob: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "DMSans_400Regular",
  },
  placeholder: {
    marginTop: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    fontWeight: "500",
  },
});
