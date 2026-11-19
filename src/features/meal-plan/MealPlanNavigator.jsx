import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MealPlanScreen from "./screens/MealPlanScreen";
import MealDetailScreen from "./screens/MealDetailScreen";
import { pushTransition } from "../../navigation/transitions";

const Stack = createNativeStackNavigator();

export default function MealPlanNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...pushTransition }}>
      <Stack.Screen name="MealPlanHome" component={MealPlanScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
    </Stack.Navigator>
  );
}
