import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../../navigation/routeNames";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import OTPVerificationScreen from "./screens/LinkVerificationScreen";
import VerifyEmail from "./screens/VerifyEmail";
import EmailVerificationSuccess from "./screens/EmailVerificationSuccess";
import ResetPasswordSuccessScreen from "./screens/ResetPasswordSuccessScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.AUTH.SIGNUP} component={SignUpScreen} />
      <Stack.Screen
        name={ROUTES.AUTH.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name={ROUTES.AUTH.OTP} component={OTPVerificationScreen} />
      <Stack.Screen name={ROUTES.AUTH.VERIFY_EMAIL} component={VerifyEmail} />
      <Stack.Screen
        name={ROUTES.AUTH.EMAIL_VERIFICATION_SUCCESS}
        component={EmailVerificationSuccess}
      />
      <Stack.Screen
        name={ROUTES.AUTH.RESET_SUCCESS}
        component={ResetPasswordSuccessScreen}
      />
    </Stack.Navigator>
  );
}
