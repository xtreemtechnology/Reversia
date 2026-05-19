import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
/* eslint-disable react-native/no-inline-styles */
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import T from "../../../theme/tokens";
import { shared } from "../styles/shared";
import ROUTES from "../../../navigation/routeNames";
import BackBtn from "../components/OnboardingHeader";
import StepDots from "../components/OnboardingProgress";
import PrimaryBtn from "../components/ContinueButton";
import ErrorMsg from "../components/ErrorBox";

export default function AccountSetupHealthStatus({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statuses = [
    {
      id: "type2",
      label: "Type 2 Diabetes",
      icon: "diabetes",
      desc: "Diagnosed by a doctor",
    },
    {
      id: "pre",
      label: "Prediabetes",
      icon: "alert-circle-outline",
      desc: "Blood sugar slightly elevated",
    },
    {
      id: "high",
      label: "High Blood Sugar Concerns",
      icon: "trending-up",
      desc: "Not yet diagnosed",
    },
    {
      id: "prevent",
      label: "Just Want Prevention",
      icon: "shield-check-outline",
      desc: "Currently healthy",
    },
    {
      id: "not_sure",
      label: "Not Sure Yet",
      icon: "help-circle-outline",
      desc: "Need a proper check-up",
    },
  ];

  const handleContinue = async () => {
    if (!selected) {
      setError("Please select an option to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_ACTIVITY);
    } catch {
      setError("Could not save your status. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.safeArea}>
      <ScrollView
        contentContainerStyle={shared.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BackBtn onPress={() => navigation.goBack()} />
        <StepDots current={7} />
        <Text style={shared.eyebrow}>Step 7 of 11</Text>
        <Text style={shared.heading}>Current health{"\n"}status?</Text>
        <Text style={shared.subheading}>
          Helps us calibrate your glucose targets and advice.
        </Text>

        <View style={{ gap: 10 }}>
          {statuses.map((s) => {
            const sel = selected === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelected(s.id)}
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
                    name={s.icon}
                    size={22}
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
                    {s.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: T.MUTED }}>{s.desc}</Text>
                </View>
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

        <ErrorMsg error={error} />
      </ScrollView>

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
