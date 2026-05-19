import React, { useState } from "react";
/* eslint-disable react-native/no-inline-styles */
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import T from "../../../theme/tokens";
import { shared } from "../styles/shared";
import ROUTES from "../../../navigation/routeNames";
import BackBtn from "../components/OnboardingHeader";
import StepDots from "../components/OnboardingProgress";
import PrimaryBtn from "../components/ContinueButton";

export default function AccountSetupGender({ navigation }) {
  const [gender, setGender] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    {
      id: "male",
      label: "Male",
      icon: "human-male",
      color: "#DBEAFE",
      accent: "#2563EB",
    },
    {
      id: "female",
      label: "Female",
      icon: "human-female",
      color: "#FCE7F3",
      accent: "#DB2777",
    },
    {
      id: "other",
      label: "Prefer not to say",
      icon: "account",
      color: T.SAGE,
      accent: T.PRIMARY,
    },
  ];

  const handleContinue = async () => {
    if (!gender) return;
    setLoading(true);
    try {
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_AGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safeArea}>
      <View style={shared.content}>
        <BackBtn onPress={() => navigation.goBack()} />
        <StepDots current={2} />
        <Text style={shared.eyebrow}>Step 2 of 11</Text>
        <Text style={shared.heading}>What is your{"\n"}biological sex?</Text>
        <Text style={shared.subheading}>
          This helps us calibrate your metabolic insights.
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {options.map((opt) => {
            const sel = gender === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setGender(opt.id)}
                activeOpacity={0.8}
                style={[
                  {
                    width: "47%",
                    backgroundColor: T.CARD,
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: T.BORDER,
                    padding: 20,
                    alignItems: "center",
                    gap: 12,
                  },
                  sel && { borderColor: opt.accent, borderWidth: 2.5 },
                  opt.id === "other" && { width: "100%" },
                ]}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: opt.color,
                  }}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={34}
                    color={opt.accent}
                  />
                </View>
                <Text
                  style={[
                    { fontSize: 15, fontWeight: "700", color: T.TEXT },
                    sel && { color: opt.accent },
                  ]}
                >
                  {opt.label}
                </Text>
                {sel && (
                  <View
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: opt.accent,
                    }}
                  >
                    <Ionicons name="checkmark" size={12} color={T.WHITE} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={shared.footer}>
        <PrimaryBtn
          onPress={handleContinue}
          loading={loading}
          disabled={!gender}
        />
      </View>
    </SafeAreaView>
  );
}
