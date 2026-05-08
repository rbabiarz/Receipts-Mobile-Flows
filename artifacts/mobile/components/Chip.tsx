import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

type ChipVariant = "mint" | "lime" | "cream" | "coral" | "outline";

interface Props {
  label: string;
  variant?: ChipVariant;
  style?: ViewStyle;
}

const BG: Record<ChipVariant, string> = {
  mint: "#c8e6cd",
  lime: "#dceeb1",
  cream: "#f4ecd6",
  coral: "#f3c9b6",
  outline: "#ffffff",
};

export function Chip({ label, variant = "outline", style }: Props) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: BG[variant],
          borderColor: variant === "outline" ? "#e6e6e6" : "transparent",
        },
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#000000",
    letterSpacing: 0.1,
  },
});
