import { Platform } from "react-native";

export const shadowStyle = ({
  color = "#000",
  offsetY = 4,
  opacity = 0.1,
  radius = 6,
  elevation = 3,
} = {}) => {
  // If `opacity` is not a plain number (e.g. an Animated.Value), avoid
  // building a CSS `box-shadow` string for web because it would stringify
  // the value into an invalid rgba() token. In that case return an empty
  // object for web so animations only affect native shadow props.
  const isNumericOpacity =
    typeof opacity === "number" && Number.isFinite(opacity);
  const box = isNumericOpacity
    ? `0px ${offsetY}px ${radius}px rgba(0,0,0,${opacity})`
    : undefined;

  return Platform.select({
    web: box ? { boxShadow: box } : {},
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation,
    },
  });
};
