import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FoodGuideScreen from "./screens/FoodGuideScreen";
import FoodDetailScreen from "./screens/FoodDetailScreen";

const Stack = createNativeStackNavigator();

export default function FoodGuideNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuideHome" component={FoodGuideScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
}
