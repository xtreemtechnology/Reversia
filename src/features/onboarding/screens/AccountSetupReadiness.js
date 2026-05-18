import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../../theme/tokens";
import { shared } from "../styles/shared";
import ROUTES from "../../../navigation/routeNames";
import BackBtn from "../components/OnboardingHeader";
import StepDots from "../components/OnboardingProgress";
import PrimaryBtn from "../components/ContinueButton";

export default function AccountSetupReadiness({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const levels = [
    {
      id: "starting",
      label: "Just Starting Out",
      desc: "Still building habits, need gentle guidance",
      emoji: "🌱",
    },
    {
      id: "momentum",
      label: "Building Momentum",
      desc: "Some routines in place, ready to level up",
      emoji: "⚡",
    },
    {
      id: "committed",
      label: "Fully Committed",
      desc: "Ready for an intensive, structured plan",
      emoji: "🔥",
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_CHECK_FREQUENCY);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safeArea}>
      <View style={shared.content}>
        <BackBtn onPress={() => navigation.goBack()} />
        <StepDots current={9} />
        <Text style={shared.eyebrow}>Step 9 of 11</Text>
        <Text style={shared.heading}>Where are you{"\n"}right now?</Text>
        <Text style={shared.subheading}>
          We'll pace your plan to match your current readiness.
        </Text>

        <View style={{ gap: 12 }}>
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
                    gap: 16,
                    backgroundColor: T.CARD,
                    padding: 20,
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: T.BORDER,
                  },
                  sel && {
                    borderColor: T.PRIMARY,
                    backgroundColor: T.PRIMARY_LIGHT,
                    borderWidth: 2.5,
                  },
                ]}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    backgroundColor: T.BG,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{l.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      {
                        fontSize: 16,
                        fontWeight: "800",
                        color: T.TEXT,
                        marginBottom: 3,
                      },
                      sel && { color: T.PRIMARY },
                    ]}
                  >
                    {l.label}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: T.MUTED, lineHeight: 18 }}
                  >
                    {l.desc}
                  </Text>
                </View>
                {sel && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={T.PRIMARY}
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
