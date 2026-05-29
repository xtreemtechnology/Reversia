import React from "react";
import { Image } from "react-native";

// Minimal OptimizedImage shim used during web bundling when the optimized
// implementation is not available. Keeps the same default props shape.
export default function OptimizedImage({
  source,
  style,
  resizeMode = "cover",
  ...rest
}) {
  const resolvedSource = typeof source === "string" ? { uri: source } : source;
  return (
    <Image
      source={resolvedSource}
      style={style}
      resizeMode={resizeMode}
      {...rest}
    />
  );
}
