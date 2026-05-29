import React from "react";
import { Ionicons } from "@expo/vector-icons";

const ICON_MAP = {
  "bell-bing-bold-duotone": "notifications",
  "cup-bold-duotone": "cafe",
  "moon-sleep-bold-duotone": "moon",
  "graph-up-bold": "trending-up",
  "plate-bold-duotone": "restaurant",
  "walking-round-bold-duotone": "walk",
  "home-smile-bold": "home",
  "home-smile-bold-duotone": "home",
  "add-circle-bold": "add-circle",
  "add-circle-bold-duotone": "add-circle",
  "book-bookmark-bold": "book",
  "book-bookmark-bold-duotone": "book",
  "user-circle-bold": "person-circle",
  "user-circle-bold-duotone": "person-circle",
};

export default function SolarIcon({ name, size = 24, color, ...rest }) {
  return (
    <Ionicons
      name={ICON_MAP[name] || "ellipse"}
      size={size}
      color={color}
      {...rest}
    />
  );
}
