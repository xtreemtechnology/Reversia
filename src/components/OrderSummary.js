// src/components/OrderSummary.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadowStyle } from "../utils/shadows";
import { useTheme } from "../theme/ThemeProvider";

export default function OrderSummary() {
  const { colors } = useTheme();
  const recentOrders = [
    {
      id: "ORD-1234",
      product: "Smart Glucometer Pro",
      status: "Delivered",
      date: "Dec 15, 2024",
      statusColor: "#10b981",
    },
    {
      id: "ORD-1235",
      product: "Test Strips (50ct)",
      status: "In Transit",
      date: "Dec 18, 2024",
      statusColor: "#f59e0b",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Recent Orders
        </Text>
        <TouchableOpacity>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {recentOrders.map((order) => (
        <TouchableOpacity
          key={order.id}
          style={[
            styles.orderCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.orderHeader}>
            <Text style={[styles.orderId, { color: colors.muted }]}>
              {order.id}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: order.statusColor + "15" },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: order.statusColor },
                ]}
              />
              <Text style={[styles.statusText, { color: order.statusColor }]}>
                {order.status}
              </Text>
            </View>
          </View>

          <Text style={[styles.productName, { color: colors.text }]}>
            {order.product}
          </Text>
          <Text style={[styles.orderDate, { color: colors.muted }]}>
            {order.date}
          </Text>

          <TouchableOpacity
            style={[
              styles.trackButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.trackButtonText, { color: colors.primary }]}>
              Track Order
            </Text>
            <Ionicons name="map-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  viewAllText: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...shadowStyle({
      color: "#000",
      offsetY: 2,
      opacity: 0.05,
      radius: 8,
      elevation: 2,
    }),
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
  },
  trackButtonText: {
    color: "#6366f1",
    fontWeight: "600",
    fontSize: 14,
  },
});
