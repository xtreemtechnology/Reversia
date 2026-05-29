import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashScreen from "../splash/SplashScreen";
import OnboardingScreen from "./OnboardingScreen";

const ONBOARDING_KEY = "@reversia_onboarding_complete";

export default function OnboardingNavigator({ onComplete }) {
  const [phase, setPhase] = React.useState("splash");

  const handleSplashFinish = () => setPhase("onboarding");

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (_) {}
    setPhase("done");
    onComplete?.();
  };

  if (phase === "splash") return <SplashScreen onFinish={handleSplashFinish} />;
  if (phase === "onboarding") return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  return null;
}
