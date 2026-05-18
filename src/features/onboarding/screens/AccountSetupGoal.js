import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import T from "../../../theme/tokens";
import { shared } from "../styles/shared";
import ROUTES from "../../../navigation/routeNames";
import BackBtn from "../components/OnboardingHeader";
import StepDots from "../components/OnboardingProgress";
import PrimaryBtn from "../components/ContinueButton";

export default function AccountSetupGoal({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const goals = [
    {
      id: "reverse",
      title: "Reverse Diabetes Naturally",
      desc: "Lower HbA1c through food, movement & sleep",
      icon: "leaf",
      iconLib: "mci",
      accent: "#EF4444",
      bg: "#FEF2F2",
    },
    {
      id: "prevent",
      title: "Prevent Diabetes Early",
      desc: "Build habits before it becomes a problem",
      icon: "dumbbell",
      iconLib: "fa5",
      accent: T.PRIMARY,
      bg: T.PRIMARY_LIGHT,
    },
    {
      id: "healthy",
      title: "Stay Healthy Daily",
      desc: "Maintain energy, weight and glucose balance",
      icon: "heart-pulse",
      iconLib: "mci",
      accent: "#0284C7",
      bg: "#EFF6FF",
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_HEALTH_STATUS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safeArea}>
      <View style={shared.content}>
        <BackBtn onPress={() => navigation.goBack()} />
        <StepDots current={6} />
        <Text style={shared.eyebrow}>Step 6 of 11</Text>
        <Text style={shared.heading}>What's your{"\n"}main goal?</Text>
        <Text style={shared.subheading}>
          We'll tailor your entire Reversia protocol around this.
        </Text>

        <View style={{ gap: 12 }}>
          {goals.map((g) => {
            const sel = selected === g.id;
            const Icon =
              g.iconLib === "fa5" ? (
                <FontAwesome5
                  name={g.icon}
                  size={22}
                  color={sel ? g.accent : T.MUTED}
                />
              ) : (
                <MaterialCommunityIcons
                  name={g.icon}
                  size={26}
                  color={sel ? g.accent : T.MUTED}
                />
              );
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => setSelected(g.id)}
                activeOpacity={0.8}
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    backgroundColor: T.CARD,
                    padding: 18,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: T.BORDER,
                  },
                  sel && {
                    borderColor: g.accent,
                    borderWidth: 2.5,
                    backgroundColor: g.bg,
                  },
                ]}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: sel ? g.accent + "20" : T.BG,
                  }}
                >
                  {Icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      {
                        fontSize: 15,
                        fontWeight: "800",
                        color: T.TEXT,
                        marginBottom: 3,
                      },
                      sel && { color: g.accent },
                    ]}
                  >
                    {g.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: T.MUTED }}>{g.desc}</Text>
                </View>
                {sel && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={g.accent}
                  />
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
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}
