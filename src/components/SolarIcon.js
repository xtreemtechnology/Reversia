import React from "react";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

const ICON_MAP = {
  "alt-arrow-right-linear": "chevron-forward",
  "bell-bing-bold-duotone": "notifications",
  "camera-bold-duotone": "camera",
  "cup-bold-duotone": "cafe",
  close: "close",
  "history-bold-duotone": "time-outline",
  "home-smile-linear": "home-outline",
  "info-circle-bold-duotone": "information-circle-outline",
  "magnifer-linear": "search",
  "microphone-bold-duotone": "mic",
  "moon-sleep-bold-duotone": "moon",
  "sleeping-bold-duotone": "bed-outline",
  "graph-up-bold": "trending-up",
  "plate-bold-duotone": "restaurant",
  "smile-circle-bold-duotone": "happy-outline",
  "star-fall-bold-duotone": "sparkles",
  "sun-fog-bold": "partly-sunny-outline",
  "user-rounded-linear": "person-outline",
  "add-circle-linear": "add-circle-outline",
  "book-bookmark-linear": "book-outline",
  "water-sun-bold-duotone": "water-outline",
  walk: "walk",
  "walking-round-bold-duotone": "walk",
  "home-smile-bold": "home",
  "home-smile-bold-duotone": "home",
  "add-circle-bold": "add-circle",
  "add-circle-bold-duotone": "add-circle",
  "book-bookmark-bold": "book",
  "book-bookmark-bold-duotone": "book",
  "user-circle-bold": "person-circle",
  "user-circle-bold-duotone": "person-circle",
  "home-bottomnav-bold": "home",
};

export default function SolarIcon({ name, size = 24, color, ...rest }) {
  if (name === "sun-fog-bold") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          d="M10.277 16.515c.005-.11.186-.154.24-.058c.254.45.686 1.111 1.176 1.412s1.276.386 1.792.408c.11.005.153.186.057.24c-.45.254-1.11.686-1.411 1.176s-.386 1.276-.408 1.792c-.005.11-.187.153-.24.057c-.254-.45-.686-1.11-1.177-1.411c-.49-.301-1.276-.386-1.791-.408c-.11-.005-.154-.187-.058-.24c.45-.254 1.111-.686 1.412-1.177c.3-.49.386-1.276.408-1.791"
        />
        <Path
          fill={color}
          d="M18.492 15.515c-.009-.11-.2-.156-.258-.062c-.172.283-.42.623-.697.793s-.692.236-1.022.262c-.11.008-.156.2-.062.257c.282.172.623.42.793.697s.236.693.262 1.023c.008.11.2.155.257.061c.172-.282.42-.623.697-.792s.693-.237 1.023-.262c.11-.009.155-.2.061-.258c-.282-.172-.623-.42-.792-.697s-.237-.692-.262-1.022"
        />
        <Path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.703 4.002l-.242-.306c-.937-1.183-1.405-1.775-1.95-1.688c-.544.088-.805.796-1.326 2.213l-.135.366c-.148.403-.222.604-.364.752s-.336.225-.724.38l-.353.141l-.247.1c-1.2.48-1.804.753-1.882 1.283c-.082.565.49 1.049 1.634 2.016l.296.25c.326.275.488.413.581.6c.094.187.107.403.133.835l.024.393c.094 1.52.14 2.28.635 2.542c.494.262 1.108-.147 2.336-.966l.318-.212c.349-.233.523-.35.723-.381s.401.024.806.136l.367.102c1.423.394 2.134.591 2.521.188c.388-.403.195-1.14-.19-2.613l-.1-.381c-.109-.419-.164-.628-.134-.835s.142-.389.366-.752l.203-.33c.785-1.276 1.178-1.914.924-2.426c-.255-.51-.988-.557-2.454-.648l-.38-.024c-.416-.026-.624-.039-.805-.135s-.314-.264-.58-.6"
        />
        <Path
          fill={color}
          d="M8.835 13.326C6.698 14.37 4.919 16.024 4.248 18c-.752-4.707.292-7.747 1.965-9.637c.144.295.332.539.5.73c.35.396.852.82 1.362 1.251l.367.31l.17.145c.005.064.01.14.015.237l.03.485c.04.655.08 1.294.178 1.805"
          opacity=".5"
        />
      </Svg>
    );
  }

  if (name === "body-check-bold") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10"
          opacity=".5"
        />
        <Path
          fill={color}
          d="M8.397 15.553a.75.75 0 0 1 1.05-.155c.728.54 1.607.852 2.553.852s1.825-.313 2.553-.852a.75.75 0 1 1 .894 1.204A5.77 5.77 0 0 1 12 17.75a5.77 5.77 0 0 1-3.447-1.148a.75.75 0 0 1-.156-1.049M15 12c.552 0 1-.672 1-1.5S15.552 9 15 9s-1 .672-1 1.5s.448 1.5 1 1.5m-6 0c.552 0 1-.672 1-1.5S9.552 9 9 9s-1 .672-1 1.5s.448 1.5 1 1.5"
        />
      </Svg>
    );
  }

  if (name === "repeat-meal-bold") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.079 5.069c3.795-3.79 9.965-3.75 13.783.069c3.82 3.82 3.86 9.993.064 13.788s-9.968 3.756-13.788-.064a9.81 9.81 0 0 1-2.798-8.28a.75.75 0 1 1 1.487.203a8.31 8.31 0 0 0 2.371 7.017c3.245 3.244 8.468 3.263 11.668.064c3.199-3.2 3.18-8.423-.064-11.668c-3.243-3.242-8.463-3.263-11.663-.068l.748.003a.75.75 0 1 1-.007 1.5l-2.546-.012a.75.75 0 0 1-.746-.747L3.575 4.33a.75.75 0 1 1 1.5-.008z"
        />
        <Path
          fill={color}
          d="M12 7.25a.75.75 0 0 1 .75.75v3.69l2.28 2.28a.75.75 0 1 1-1.06 1.06l-2.427-2.426a1 1 0 0 1-.293-.708V8a.75.75 0 0 1 .75-.75"
          opacity=".5"
        />
      </Svg>
    );
  }

  if (name === "plate-bold-duotone") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          d="M1 12c0-3.75 0-5.625.955-6.939A5 5 0 0 1 3.06 3.955C4.375 3 6.251 3 10 3h4c3.75 0 5.625 0 6.939.955a5 5 0 0 1 1.106 1.106C23 6.375 23 8.251 23 12s0 5.625-.955 6.939a5 5 0 0 1-1.106 1.106C19.625 21 17.749 21 14 21h-4c-3.75 0-5.625 0-6.939-.955a5 5 0 0 1-1.106-1.106C1 17.625 1 15.749 1 12"
          opacity=".5"
        />
        <Path
          fill={color}
          d="M12.75 3a.75.75 0 0 0-1.5 0v2a.75.75 0 0 0 1.5 0zM8 9.75a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5zm0 3.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5z"
        />
      </Svg>
    );
  }

  if (name === "home-bottomnav-bold") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.52 7.823C2 8.77 2 9.915 2 12.203v1.522c0 3.9 0 5.851 1.172 7.063S6.229 22 10 22h4c3.771 0 5.657 0 6.828-1.212S22 17.626 22 13.725v-1.521c0-2.289 0-3.433-.52-4.381c-.518-.949-1.467-1.537-3.364-2.715l-2-1.241C14.111 2.622 13.108 2 12 2s-2.11.622-4.116 1.867l-2 1.241C3.987 6.286 3.038 6.874 2.519 7.823m6.927 7.575a.75.75 0 1 0-.894 1.204A5.77 5.77 0 0 0 12 17.75a5.77 5.77 0 0 0 3.447-1.148a.75.75 0 1 0-.894-1.204A4.27 4.27 0 0 1 12 16.25a4.27 4.27 0 0 1-2.553-.852"
        />
      </Svg>
    );
  }

  if (name === "book-bookmark-bold-duotone") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path
          d="M4 8c0-2.828 0-4.243.879-5.121C5.757 2 7.172 2 10 2h4c2.828 0 4.243 0 5.121.879C20 3.757 20 5.172 20 8v8c0 2.828 0 4.243-.879 5.121C18.243 22 16.828 22 14 22h-4c-2.828 0-4.243 0-5.121-.879C4 20.243 4 18.828 4 16V8Z"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
        <Path
          d="M19.898 16h-12c-.93 0-1.395 0-1.777.102A3 3 0 0 0 4 18.224"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
        <Path
          d="M8 7h8m-8 3.5h5m0 5.5v3.53c0 .276 0 .414-.095.47c-.095.056-.224-.006-.484-.13l-1.242-.59c-.088-.04-.132-.062-.179-.062c-.047 0-.091.021-.179.063l-1.242.59c-.26.123-.39.185-.484.129C9 19.944 9 19.806 9 19.53v-3.08"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === "user-circle-bold-duotone") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          d="M12 2c2.209 0 4 1.791 4 4s-1.791 4-4 4s-4-1.791-4-4s1.791-4 4-4"
        />
        <Path
          fill={color}
          d="M12 13c-3.866 0-7 1.79-7 4c0 2.209 3.134 4 7 4s7-1.791 7-4c0-2.21-3.134-4-7-4"
        />
      </Svg>
    );
  }

  if (name === "water-sun-bold-duotone") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75ZM1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75Zm19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Z"
        />
        <Path
          fill={color}
          d="M22.172 16.042c-1.323-.311-2.001-1.053-2.626-1.999a1.747 1.747 0 0 0-1.677-.79a6 6 0 1 0-11.775-.19a1.706 1.706 0 0 0-1.524.803c-.662 1.035-1.34 1.846-2.742 2.176a.75.75 0 1 0 .344 1.46c1.967-.463 2.922-1.672 3.662-2.828a.23.23 0 0 1 .196-.114a.304.304 0 0 1 .246.125C7.389 16.11 9.158 17.75 12 17.75c2.76 0 4.539-1.27 5.706-2.83a.432.432 0 0 1 .335-.177a.28.28 0 0 1 .253.127c.727 1.1 1.682 2.196 3.534 2.632a.75.75 0 0 0 .344-1.46Z"
        />
        <Path
          fill={color}
          d="M4.4 4.398a.75.75 0 0 1 1.06 0l.393.393a.75.75 0 1 1-1.06 1.06l-.394-.392a.75.75 0 0 1 0-1.06Zm15.2.001a.75.75 0 0 1 0 1.06l-.392.393a.75.75 0 0 1-1.06-1.06l.392-.393a.75.75 0 0 1 1.06 0ZM4.57 18.866c.687-1.074 2.157-1.039 2.888-.104c.99 1.267 2.372 2.488 4.542 2.488c2.209 0 3.57-.979 4.505-2.229c.72-.962 2.286-1.12 3.04.023c.626.945 1.304 1.687 2.627 1.999a.75.75 0 1 1-.344 1.46c-1.852-.437-2.807-1.534-3.534-2.632a.28.28 0 0 0-.253-.128a.432.432 0 0 0-.335.177C16.54 21.48 14.76 22.75 12 22.75c-2.842 0-4.611-1.64-5.724-3.064a.304.304 0 0 0-.246-.126a.23.23 0 0 0-.196.114c-.74 1.156-1.695 2.365-3.662 2.829a.75.75 0 1 1-.344-1.46c1.401-.33 2.08-1.142 2.742-2.177Z"
          opacity=".5"
        />
      </Svg>
    );
  }

  if (name === "focus-star-bold") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
        <Path d="M0 0h24v24H0z" fill="none" />
        <Path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.25 19a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75m3 3a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75"
        />
        <Path
          fill={color}
          d="M6.083 15.25a6.75 6.75 0 1 1 11.835 0H22a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1 0-1.5z"
        />
        <Path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 1.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V2a.75.75 0 0 1 .75-.75M4.399 4.399a.75.75 0 0 1 1.06 0l.393.392a.75.75 0 0 1-1.06 1.061l-.393-.393a.75.75 0 0 1 0-1.06m15.202 0a.75.75 0 0 1 0 1.06l-.393.393a.75.75 0 0 1-1.06-1.06l.393-.393a.75.75 0 0 1 1.06 0M1.25 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5H2a.75.75 0 0 1-.75-.75m19 0a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75"
        />
      </Svg>
    );
  }

  return (
    <Ionicons
      name={ICON_MAP[name] || "ellipse"}
      size={size}
      color={color}
      {...rest}
    />
  );
}
