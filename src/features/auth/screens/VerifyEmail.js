import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";

export default function VerifyEmail({ navigation, route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(59);
  const userEmail = route.params?.email || "naura.adinda80@gmail.com";

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Your Email</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.imageCircle}>
            <Ionicons
              name="mail-unread-outline"
              size={70}
              color={colors.primary}
            />
          </View>
          <View
            style={[
              styles.dot,
              { backgroundColor: "#22C55E", top: 10, left: -10 },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: "#F97316",
                top: 0,
                right: 0,
                width: 20,
                height: 20,
              },
            ]}
          />
          <View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                bottom: 20,
                left: -20,
                opacity: 0.4,
              },
            ]}
          />
          <View
            style={[
              styles.dot,
              { backgroundColor: "#BBF7D0", bottom: 0, right: -10 },
            ]}
          />
        </View>

        <Text style={styles.instructionText}>
          Please enter the 6 digit OTP code that we sent to your email (
          {userEmail})
        </Text>

        <View style={styles.otpInputContainer}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="0 0 0 0 0 0"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            letterSpacing={10}
            underlineColorAndroid="transparent"
          />
        </View>

        <TouchableOpacity disabled={timer > 0} style={styles.resendButton}>
          <Text style={styles.resendText}>
            Resend code ({timer < 10 ? `00:0${timer}` : `00:${timer}`})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => navigation.navigate("EmailVerificationSuccess")}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      height: 56,
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    backButton: { padding: 8 },
    content: {
      flex: 1,
      paddingHorizontal: 25,
      alignItems: "center",
      paddingTop: 20,
    },
    illustrationContainer: {
      width: 200,
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 40,
    },
    imageCircle: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.card,
      justifyContent: "center",
      alignItems: "center",
    },
    dot: { position: "absolute", width: 12, height: 12, borderRadius: 6 },
    instructionText: {
      fontSize: 15,
      color: colors.text,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 40,
    },
    otpInputContainer: {
      width: "100%",
      height: 60,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      marginBottom: 30,
    },
    otpInput: {
      fontSize: 22,
      fontWeight: "600",
      color: colors.text,
      ...Platform.select({ web: { outlineStyle: "none" } }),
    },
    resendButton: { marginBottom: 40 },
    resendText: {
      color: colors.muted,
      textDecorationLine: "underline",
      fontSize: 16,
    },
    sendButton: {
      backgroundColor: colors.primary,
      height: 65,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
    },
    sendButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: "700",
    },
  });
