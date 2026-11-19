import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LearnScreen from "./screens/LearnScreen";
import InsightDetailScreen from "./screens/InsightDetailScreen";
import HydrationConnectionScreen from "./screens/HydrationConnectionScreen";
import SleepRecoveryScreen from "./screens/SleepRecoveryScreen";
import ProteinEnergyScreen from "./screens/ProteinEnergyScreen";
import ExperimentDetailScreen from "./screens/ExperimentDetailScreen";
import {
  FoodSugarInsightsScreen,
  FoodSugarDetailScreen,
} from "../insights";

const Stack = createNativeStackNavigator();

export default function LearnNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LearnHome" component={LearnScreen} />
      <Stack.Screen name="InsightDetail" component={InsightDetailScreen} />
      <Stack.Screen
        name="HydrationConnection"
        component={HydrationConnectionScreen}
      />
      <Stack.Screen name="SleepRecovery" component={SleepRecoveryScreen} />
      <Stack.Screen name="ProteinEnergy" component={ProteinEnergyScreen} />
      <Stack.Screen
        name="ExperimentDetail"
        component={ExperimentDetailScreen}
      />
      <Stack.Screen
        name="FoodSugarInsights"
        component={FoodSugarInsightsScreen}
      />
      <Stack.Screen
        name="FoodSugarDetail"
        component={FoodSugarDetailScreen}
      />
    </Stack.Navigator>
  );
}
