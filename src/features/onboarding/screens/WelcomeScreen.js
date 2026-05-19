import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Animated,
  Text,
  TouchableOpacity,
} from "react-native";
/* eslint-disable react-native/no-inline-styles */
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import T from "../../../theme/tokens";
import { shared } from "../styles/shared";
import ROUTES from "../../../navigation/routeNames";

export default function WelcomeScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideY, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slideY]);

  const pills = [
    "Blood Sugar Tracking",
    "AI Meal Insights",
    "Daily Plans",
    "Sleep & Activity",
  ];

  return (
    <SafeAreaView style={shared.safeArea}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fade, transform: [{ translateY: slideY }] }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: T.PRIMARY,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="leaf" size={22} color={T.WHITE} />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: T.TEXT,
                letterSpacing: -0.5,
              }}
            >
              Reversia
            </Text>
          </View>

          <View
            style={{
              backgroundColor: T.PRIMARY,
              borderRadius: 28,
              padding: 24,
              marginBottom: 28,
            }}
          >
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 18,
                  padding: 14,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="water-percent"
                  size={28}
                  color={T.AMBER}
                />
                <Text
                  style={{ fontSize: 22, fontWeight: "800", color: T.WHITE }}
                >
                  98
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: "600",
                  }}
                >
                  mg/dL
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: T.SAGE,
                  borderRadius: 18,
                  padding: 14,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Ionicons name="moon-outline" size={22} color={T.PRIMARY} />
                <Text
                  style={{ fontSize: 22, fontWeight: "800", color: T.PRIMARY }}
                >
                  7h 15m
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: "600",
                  }}
                >
                  Sleep
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: T.WHITE,
                lineHeight: 32,
                marginBottom: 16,
                letterSpacing: -0.5,
              }}
            >
              Your health,{"\n"}reversed naturally.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {pills.map((p) => (
                <View
                  key={p}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.18)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{ fontSize: 11, color: T.WHITE, fontWeight: "700" }}
                  >
                    {p}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: T.TEXT,
              letterSpacing: -0.8,
              lineHeight: 38,
              marginBottom: 12,
            }}
          >
            Take control of{"\n"}your glucose — today.
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: T.MUTED,
              lineHeight: 22,
              marginBottom: 32,
            }}
          >
            Personalised meal plans, glucose tracking, and AI insights designed
            for diabetes reversal.
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: T.PRIMARY,
              height: 58,
              borderRadius: 29,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(ROUTES.ONBOARDING.ACCOUNT_SETUP_NAME)
            }
          >
            <Text style={{ color: T.WHITE, fontSize: 16, fontWeight: "800" }}>
              Get Started Free
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={T.WHITE}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: "center", paddingVertical: 10 }}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(ROUTES.ROOT.AUTH, {
                screen: ROUTES.AUTH.LOGIN,
              })
            }
          >
            <Text style={{ color: T.MUTED, fontSize: 14, fontWeight: "600" }}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
