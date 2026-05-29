import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../../theme/ThemeProvider";
import SolarIcon from "../../../components/SolarIcon";

const PATTERNS = [
  {
    id: "evening-meals",
    icon: "plate-bold-duotone",
    colorKey: "destructive",
    tag: "Observation",
    title: "Evening Meals",
    body: "Late evening garri meals may be contributing to mild overnight glucose spikes. Consider having lighter dinners earlier.",
  },
  {
    id: "post-meal",
    icon: "walking-round-bold-duotone",
    colorKey: "primary",
    tag: "Positive",
    title: "Post-meal Movement",
    body: "Your short walks after lunch are effectively keeping your afternoon energy levels stable. Great habit!",
  },
];

export default function RecentPatterns({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Recent Patterns
        </Text>
        <TouchableOpacity onPress={() => navigation?.navigate("Learn")}>
          <Text style={[styles.seeDetails, { color: colors.primary }]}>
            See details
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        snapToInterval={296} // card width (280) + gap (16)
        decelerationRate="fast"
      >
        {PATTERNS.map((item) => {
          const color = colors[item.colorKey];
          const bgColor = color + "33";
          const tagBg = color + "1A";

          return (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border + "80",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
                  <SolarIcon name={item.icon} size={20} color={color} />
                </View>
                <View style={[styles.tag, { backgroundColor: tagBg }]}>
                  <Text style={[styles.tagText, { color }]}>{item.tag}</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.cardBody, { color: colors.mutedForeground }]}
              >
                {item.body}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  seeDetails: {
    fontSize: 14,
    fontWeight: "500",
  },
  scroll: {
    gap: 16,
    paddingRight: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    width: 280,
    borderWidth: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
  },
});
