import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import {
  AntDesign,
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { auth } from "../../config/firebase";
import { ROUTES } from "../../navigation/routeNames";
import { useTheme } from "../../theme/ThemeProvider";

export default function AccountSetupComplete({ navigation }) {
  const chartHeight = 150;
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 80;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Text style={styles.title}>Everything is ready!</Text>
        <Text style={styles.subtitle}>
          Your natural reversal plan is ready. Let's start your journey to
          better health.
        </Text>

        {/* Natural Progress Card */}
        <View style={styles.predictionCard}>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Natural Reversal</Text>
            </View>
          </View>

          <Text style={styles.timeframeText}>
            Projected 4-Month HbA1c Improvement
          </Text>

          {/* Curve Graph representing natural progress */}
          <View style={styles.chartWrapper}>
            <Svg height={chartHeight} width={chartWidth}>
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.4" />
                  <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.05" />
                </LinearGradient>
              </Defs>
              <Path
                d={`M 0 30 Q ${chartWidth / 2} 40, ${chartWidth} 110`}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
              />
              <Path
                d={`M 0 30 Q ${
                  chartWidth / 2
                } 40, ${chartWidth} 110 L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                fill="url(#grad)"
              />
              <Circle cx="0" cy="30" r="6" fill="#FFFFFF" />
              <Circle
                cx={chartWidth}
                cy="110"
                r="6"
                fill="#82B1FF"
                stroke="#FFF"
                strokeWidth="2"
              />

            <View style={styles.chartLabels}>
              <View style={styles.labelBox}>
                <Text style={styles.labelText}>Current Status</Text>
                <Text style={styles.labelValue}>High Risk</Text>
              </View>
              <View style={[styles.labelBox, { alignItems: "flex-end" }]}>
                <Text style={styles.labelText}>Natural Target</Text>
                <Text style={styles.labelValue}>Optimal Range</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Natural Management Plan */}
        <View style={styles.detailsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Daily Natural Management Plan
            </Text>
          </View>

          {/* Row 1: Nutrition Focus */}
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <MaterialCommunityIcons
                name="food-apple"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.rowLabel}>Nutrition Focus</Text>
            </View>
            <Text style={styles.rowValue}>Low Glycemic</Text>
          </View>

          {/* Row 2: Physical Activity */}
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <FontAwesome5
                name="walking"
                size={18}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.rowLabel}>Daily Home workout</Text>
            </View>
            <Text style={styles.rowValue}>30 min Walk</Text>
          </View>

          {/* Row 3: Fasting Windows */}
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.rowLabel}>Intermittent Fasting</Text>
            </View>
            <Text style={styles.rowValue}>14:10 Window</Text>
          </View>

          {/* Row 4: Education */}
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <Ionicons
                name="book-outline"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
              <Text style={styles.rowLabel}>Weekly Lesson</Text>
            </View>
            <Text style={styles.rowValue}>Insulin Sensitivity</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={() => {
            if (!auth.currentUser) {
              navigation.replace("Auth", { screen: ROUTES.AUTH.LOGIN });
              return;
            }

            navigation.replace("MainApp");
          }}
        >
          <Text style={styles.startButtonText}>Start Natural Journey</Text>
          <AntDesign
            name="arrowright"
            size={20}
            color="#FFF"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 130 },
    title: {
      fontSize: 30,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 30,
    },
    predictionCard: {
      backgroundColor: colors.primary,
      borderRadius: 32,
      padding: 24,
      marginBottom: 20,
      elevation: 8,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { height: 5, width: 0 },
    },
    badgeContainer: { alignItems: "center", marginBottom: 15 },
    badge: {
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 20,
      paddingVertical: 6,
      borderRadius: 20,
    },
    badgeText: {
      color: colors.primary,
      fontWeight: "800",
      fontSize: 14,
      textTransform: "uppercase",
    },
    timeframeText: {
      color: "#FFFFFF",
      textAlign: "center",
      fontSize: 13,
      opacity: 0.9,
      marginBottom: 20,
      fontWeight: "500",
    },
    chartWrapper: { height: 180 },
    chartLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 15,
    },
    labelBox: {
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: 10,
      borderRadius: 12,
      minWidth: 100,
    },
    labelText: { color: "#FFFFFF", fontSize: 11, opacity: 0.8, marginBottom: 2 },
    labelValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    detailsContainer: {
      backgroundColor: colors.primary,
      borderRadius: 32,
      padding: 20,
      paddingBottom: 35,
    },
    sectionHeader: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingVertical: 12,
      borderRadius: 16,
      marginBottom: 25,
      alignItems: "center",
    },
    sectionTitle: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 22,
      paddingHorizontal: 5,
    },
    rowLabelContainer: { flexDirection: "row", alignItems: "center" },
    rowLabel: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 15,
      marginLeft: 10,
      fontWeight: "500",
    },
    rowValue: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
    footer: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      paddingHorizontal: 25,
      paddingBottom: 40,
      backgroundColor: colors.background,
    },
    startButton: {
      backgroundColor: colors.text,
      height: 65,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    startButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  });
