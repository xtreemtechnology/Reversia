import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthLandingScreen from "./screens/AuthLandingScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import CheckEmailScreen from "./screens/CheckEmailScreen";
import EmailVerificationScreen from "./screens/EmailVerificationScreen";
import PostOnboardingFlow from "../onboarding/post-onboarding";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}
      initialRouteName="AuthLanding"
    >
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
      />
      <Stack.Screen
        name="PostOnboarding"
        component={PostOnboardingFlow}
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
