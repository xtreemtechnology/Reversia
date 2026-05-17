import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subscribeNotifications } from "../../utils/notificationService";
import { useTheme } from "../../theme/ThemeProvider";

const HEIGHT = 80;

export default function NotificationHost() {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const anim = useRef(new Animated.Value(-HEIGHT)).current;
  const hideTimeout = useRef(null);

  useEffect(() => {
    const unsub = subscribeNotifications((n) => {
      setQueue((q) => [...q, n]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!current && queue.length > 0) {
      const next = queue[0];
      setQueue((q) => q.slice(1));
      setCurrent(next);
    }
  }, [queue, current]);

  useEffect(() => {
    if (current) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => {
          dismissCurrent();
        }, current.duration || 4000);
      });
    }
    return () => {};
  }, [current]);

  function dismissCurrent() {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    Animated.timing(anim, {
      toValue: -HEIGHT,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setCurrent(null);
    });
  }

  if (!current) return null;

  const bg = getBackgroundColorForType(current.type, colors);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { top: insets.top || 0, transform: [{ translateY: anim }] },
      ]}
    >
      <View style={[styles.container, { backgroundColor: bg, borderColor: colors.border }]}> 
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (current.action && typeof current.action === "function") {
              try {
                current.action();
              } catch {}
            }
            dismissCurrent();
          }}
          style={styles.content}
        >
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {current.title || capitalize(current.type)}
          </Text>
          {current.message ? (
            <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
              {current.message}
            </Text>
          ) : null}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getBackgroundColorForType(type, colors) {
  switch (type) {
    case "success":
      return "#10B981"; // green
    case "error":
      return "#EF4444"; // red
    case "warning":
      return "#F59E0B"; // amber
    default:
      return colors.card || "#111827"; // default
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  container: {
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: { fontSize: 15, fontWeight: "700" },
  message: { fontSize: 13, marginTop: 4, opacity: 0.95 },
});
