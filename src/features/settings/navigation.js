import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";

// Import settings screens
import EditProfile from "./screens/EditProfile";
import NotificationSettings from "./screens/NotificationSettings";
import ChangePassword from "./screens/ChangePassword";
import {
  Appearance,
  PrivacySettings,
  DataSync,
  ExportData,
  About,
  Support,
} from "../../screens/settings/PlaceholderSettings";

const Stack = createNativeStackNavigator();

/**
 * SettingsStack - Feature-level navigation for all settings screens
 * Registered as a nested stack in AppStackNavigator
 */
export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={ROUTES.SETTINGS.EDIT_PROFILE}
        component={EditProfile}
      />
      <Stack.Screen
        name={ROUTES.SETTINGS.NOTIFICATIONS}
        component={NotificationSettings}
      />
      <Stack.Screen
        name={ROUTES.SETTINGS.CHANGE_PASSWORD}
        component={ChangePassword}
      />
      <Stack.Screen name={ROUTES.SETTINGS.APPEARANCE} component={Appearance} />
      <Stack.Screen
        name={ROUTES.SETTINGS.PRIVACY}
        component={PrivacySettings}
      />
      <Stack.Screen name={ROUTES.SETTINGS.DATA_SYNC} component={DataSync} />
      <Stack.Screen name={ROUTES.SETTINGS.EXPORT_DATA} component={ExportData} />
      <Stack.Screen name={ROUTES.SETTINGS.ABOUT} component={About} />
      <Stack.Screen name={ROUTES.SETTINGS.SUPPORT} component={Support} />
    </Stack.Navigator>
  );
}
