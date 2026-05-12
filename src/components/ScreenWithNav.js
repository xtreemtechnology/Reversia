import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";

export const NavItem = ({ name, icon, active, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={active ? colors.primary : colors.muted}
      />
      <Text
        style={[
          styles.navText,
          {
            color: active ? colors.primary : colors.muted,
            fontWeight: active ? "500" : "400",
          },
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

export const NavigationBar = ({ activeScreen }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomOffset =
    Platform.OS === "android" ? Math.max(insets.bottom, 16) : insets.bottom;

  const handleNavigation = (screen) => {
    // Navigate through MainTabs (nested in MainApp stack)
    if (screen === "Home") {
      navigation.navigate("MainTabs", { screen: "Home" });
    } else if (screen === "Log") {
      navigation.navigate("MainTabs", { screen: "Log" });
    } else if (screen === "Scan") {
      navigation.navigate("MainTabs", { screen: "Scan" });
    } else if (screen === "Meal") {
      navigation.navigate("MainTabs", { screen: "Meal" });
    } else if (screen === "Profile") {
      navigation.navigate("MainTabs", { screen: "Profile" });
    }
  };

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          bottom: bottomOffset,
          paddingBottom: Math.max(bottomOffset, 8),
        },
      ]}
    >
      <NavItem
        name="Home"
        icon="home-variant"
        active={activeScreen === "Home"}
        onPress={() => handleNavigation("Home")}
      />
      <NavItem
        name="Log"
        icon="plus"
        active={activeScreen === "Log"}
        onPress={() => handleNavigation("Log")}
      />
      <View style={styles.scanWrapper}>
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleNavigation("Scan")}
        >
          <Ionicons name="scan" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <NavItem
        name="Meal"
        icon="silverware-fork-knife"
        active={activeScreen === "Meal"}
        onPress={() => handleNavigation("Meal")}
      />
      <NavItem
        name="Profile"
        icon="account"
        active={activeScreen === "Profile"}
        onPress={() => handleNavigation("Profile")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: "absolute",
    width: "100%",
    height: 85,
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: 15,
    alignItems: "center",
    ...shadowStyle({ offsetY: -6, opacity: 0.07, radius: 12, elevation: 10 }),
  },
  navItem: { flex: 1, alignItems: "center" },
  scanWrapper: { position: "relative", top: -30 },
  scanBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    ...shadowStyle({ offsetY: 6, opacity: 0.12, radius: 12, elevation: 5 }),
  },
  navText: { fontSize: 12, marginTop: 5 },
});
