import React, { useState } from "react";
import { validateName } from "../../utils/validation";
import { handleFirestoreError, logError } from "../../utils/errorHandling";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserProfile } from "../../hooks/useUserProfile";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useTheme } from "../../theme/ThemeProvider";

export default function EditProfile({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const { userData } = useUserProfile();
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const styles = getStyles(colors, isDark);

  const handleSave = async () => {
    setMessage(null);
    const firstNameValidation = validateName(firstName);
    if (!firstNameValidation.isValid) {
      setMessage(firstNameValidation.error);
      return;
    }

    const lastNameValidation = validateName(lastName);
    if (!lastNameValidation.isValid) {
      setMessage(lastNameValidation.error);
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Please log in to update your profile");
        return;
      }

      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          updatedAt: new Date().toISOString(),
        });
        setMessage("Profile updated successfully");
        navigation.goBack();
      }
    } catch (error) {
      logError("EditProfile.handleSave", error, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      const errorInfo = handleFirestoreError(error);
      setMessage(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveBtn, loading && { opacity: 0.6 }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName[0] || "D"}
              {lastName[0] || "N"}
            </Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn}>
            <MaterialCommunityIcons name="camera-plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { color: colors.muted }]}
            value={email}
            editable={false}
            placeholder="Email"
            placeholderTextColor={colors.muted}
          />
          <Text style={styles.hint}>
            Email cannot be changed. Contact support for assistance.
          </Text>
        </View>

        {message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    title: { fontSize: 20, fontWeight: "800", color: colors.text },
    saveBtn: { color: colors.primary, fontWeight: "700", fontSize: 16 },
    content: { paddingHorizontal: 20, paddingVertical: 20 },
    avatarSection: { alignItems: "center", marginBottom: 30 },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    avatarText: { color: "#FFF", fontSize: 36, fontWeight: "800" },
    uploadBtn: {
      position: "absolute",
      bottom: 0,
      right: "33%",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.text,
      justifyContent: "center",
      alignItems: "center",
    },
    section: { marginBottom: 20 },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.muted,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hint: { fontSize: 12, color: colors.muted, marginTop: 6 },
    messageBox: {
      backgroundColor: "#FEE2E2",
      padding: 12,
      borderRadius: 12,
      marginTop: 6,
      marginBottom: 12,
    },
    messageText: { color: "#B91C1C", textAlign: "center" },
  });

const styles = StyleSheet.create({});
