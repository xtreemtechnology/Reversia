import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import T from "../../../theme/tokens";
import { shared } from "../styles/shared";
import ROUTES from "../../../navigation/routeNames";
import BackBtn from "../components/OnboardingHeader";
import StepDots from "../components/OnboardingProgress";
import PrimaryBtn from "../components/ContinueButton";

export default function AccountSetupActivity({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const levels = [
    {
      id: "sedentary",
      label: "Sedentary",
      desc: "Desk job, little movement",
      icon: "sofa-outline",
      steps: "<3,000 steps",
    },
    {
      id: "lightly",
      label: "Lightly Active",
      desc: "Light walks, some chores",
      icon: "walk",
      steps: "3–6,000 steps",
    },
    {
      id: "moderately",
      label: "Moderately Active",
      desc: "Regular exercise 3× week",
      icon: "run",
      steps: "6–10,000 steps",
    },
    {
      id: "very",
      label: "Very Active",
      desc: "Daily intense exercise",
      icon: "bike",
      steps: "10,000+ steps",
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_READINESS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safeArea}>
      <View style={shared.content}>
        <BackBtn onPress={() => navigation.goBack()} />
        <StepDots current={8} />
        <Text style={shared.eyebrow}>Step 8 of 11</Text>
        <Text style={shared.heading}>How active are{"\n"}you daily?</Text>
        <Text style={shared.subheading}>
          This sets your step goals and calorie burn estimates.
        </Text>

        <View style={{ gap: 10 }}>
          {levels.map((l) => {
            const sel = selected === l.id;
            return (
              <TouchableOpacity
                key={l.id}
                onPress={() => setSelected(l.id)}
                activeOpacity={0.8}
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    backgroundColor: T.CARD,
                    padding: 16,
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: T.BORDER,
                  },
                  sel && {
                    borderColor: T.PRIMARY,
                    backgroundColor: T.PRIMARY_LIGHT,
                    borderWidth: 2,
                  },
                ]}
              >
                <View
                  style={[
                    {
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: T.BG,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    sel && { backgroundColor: "rgba(34,66,47,0.14)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={l.icon}
                    size={24}
                    color={sel ? T.PRIMARY : T.MUTED}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      {
                        fontSize: 15,
                        fontWeight: "700",
                        color: T.TEXT,
                        marginBottom: 2,
                      },
                      sel && { color: T.PRIMARY },
                    ]}
                  >
                    {l.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: T.MUTED }}>{l.desc}</Text>
                </View>
                <View
                  style={[
                    {
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      backgroundColor: T.BG,
                    },
                    sel && { backgroundColor: "rgba(34,66,47,0.12)" },
                  ]}
                >
                  <Text
                    style={[
                      { fontSize: 11, fontWeight: "700", color: T.MUTED },
                      sel && { color: T.PRIMARY },
                    ]}
                  >
                    {l.steps}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={shared.footer}>
        <PrimaryBtn
          onPress={handleContinue}
          loading={loading}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}
