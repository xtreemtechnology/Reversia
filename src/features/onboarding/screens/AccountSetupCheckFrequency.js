import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import T from "../../../theme/tokens";
import { shared } from "../styles/shared";
import ROUTES from "../../../navigation/routeNames";
import BackBtn from "../components/OnboardingHeader";
import StepDots from "../components/OnboardingProgress";
import PrimaryBtn from "../components/ContinueButton";

export default function AccountSetupCheckFrequency({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = [
    { id: "multiple_daily", label: "Multiple times a day", icon: "clock-fast" },
    { id: "once_daily", label: "Once a day", icon: "clock-outline" },
    { id: "weekly", label: "A few times a week", icon: "calendar-week" },
    { id: "rarely", label: "Rarely or never", icon: "calendar-question" },
  ];

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_COMPLETE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safeArea}>
      <View style={shared.content}>
        <BackBtn onPress={() => navigation.goBack()} />
        <StepDots current={10} />
        <Text style={shared.eyebrow}>Step 10 of 11</Text>
        <Text style={shared.heading}>
          How often do you{"\n"}check your glucose?
        </Text>
        <Text style={shared.subheading}>
          We'll set reminder frequency to match your habits.
        </Text>

        <View style={{ gap: 10 }}>
          {options.map((o) => {
            const sel = selected === o.id;
            return (
              <TouchableOpacity
                key={o.id}
                onPress={() => setSelected(o.id)}
                activeOpacity={0.8}
                style={[
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    backgroundColor: T.CARD,
                    paddingHorizontal: 18,
                    paddingVertical: 16,
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
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: T.BG,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    sel && { backgroundColor: "rgba(34,66,47,0.12)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={o.icon}
                    size={22}
                    color={sel ? T.PRIMARY : T.MUTED}
                  />
                </View>
                <Text
                  style={[
                    { fontSize: 15, fontWeight: "700", color: T.TEXT, flex: 1 },
                    sel && { color: T.PRIMARY },
                  ]}
                >
                  {o.label}
                </Text>
                {sel && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
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
