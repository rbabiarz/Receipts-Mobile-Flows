import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: "dark" | "light" | "ghost" | "danger";
  flex?: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function PillButton({
  label,
  onPress,
  variant = "dark",
  flex = false,
  loading = false,
  disabled = false,
  size = "md",
  style,
}: Props) {
  const isSmall = size === "sm";

  const bgColor = {
    dark: "#000000",
    light: "#ffffff",
    ghost: "rgba(0,0,0,0.05)",
    danger: "#f3c9b6",
  }[variant];

  const textColor = {
    dark: "#ffffff",
    light: "#000000",
    ghost: "#000000",
    danger: "#000000",
  }[variant];

  const borderColor = {
    dark: "transparent",
    light: "#e6e6e6",
    ghost: "transparent",
    danger: "transparent",
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: bgColor,
          borderColor,
          opacity: pressed || disabled ? 0.65 : 1,
          flex: flex ? 1 : undefined,
          paddingHorizontal: isSmall ? 10 : 14,
          paddingVertical: isSmall ? 7 : 10,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: textColor, fontSize: isSmall ? 11 : 13 },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  label: {
    fontFamily: "Inter_500Medium",
    letterSpacing: -0.1,
  },
});
