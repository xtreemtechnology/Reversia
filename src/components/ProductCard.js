// src/components/ProductCard.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";

export default function ProductCard({
  title,
  description,
  price,
  benefitText,
  onBuyPress,
}) {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleValue }] }]}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons name="medical-outline" size={48} color="#6366f1" />
      </View>

      <View style={styles.content}>
        <View style={styles.benefitBadge}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={styles.benefitText}>{benefitText}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{price}</Text>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onBuyPress}
            style={styles.buyButton}
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    ...shadowStyle({
      color: "#000",
      offsetY: 4,
      opacity: 0.08,
      radius: 12,
      elevation: 4,
    }),
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  benefitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366f1",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  buyButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },
});
