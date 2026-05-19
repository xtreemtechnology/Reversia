/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { subscribeConfirm } from "../../utils/confirmService";
import { useTheme } from "../../theme/ThemeProvider";

export default function ConfirmHost() {
  const [req, setReq] = useState(null);
  const { colors } = useTheme();

  useEffect(() => {
    const unsub = subscribeConfirm((r) => setReq(r));
    return unsub;
  }, []);

  if (!req) return null;

  const {
    title,
    message,
    confirmText = "OK",
    cancelText = "Cancel",
    resolve,
  } = req;

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: colors.muted }]}>
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.border }]}
              onPress={() => {
                setReq(null);
                resolve(false);
              }}
            >
              <Text style={{ color: colors.text }}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
              onPress={() => {
                setReq(null);
                resolve(true);
              }}
            >
              <Text style={{ color: colors.background, fontWeight: "700" }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
  },
  title: { fontSize: 17, fontWeight: "800" },
  message: { marginTop: 8, fontSize: 14 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnPrimary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
});
