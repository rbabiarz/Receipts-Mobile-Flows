import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { GradeLevel } from "@/types";

interface Props {
  grade: GradeLevel;
  label?: string;
  size?: "sm" | "md";
}

const GRADE_CONFIG: Record<
  GradeLevel,
  { bg: string; label: string }
> = {
  A: { bg: "#c8e6cd", label: "Strong" },
  B: { bg: "#dceeb1", label: "Moderate" },
  C: { bg: "#f4ecd6", label: "Suggestive" },
  D: { bg: "#f3c9b6", label: "Limited" },
};

export function GradeChip({ grade, label, size = "md" }: Props) {
  const config = GRADE_CONFIG[grade];
  const isSmall = size === "sm";

  return (
    <View style={[styles.pill, { backgroundColor: "#000000" }]}>
      <View
        style={[
          styles.letter,
          { width: isSmall ? 16 : 18, height: isSmall ? 16 : 18 },
        ]}
      >
        <Text style={[styles.letterText, { fontSize: isSmall ? 9 : 11 }]}>
          {grade}
        </Text>
      </View>
      <Text style={[styles.label, { fontSize: isSmall ? 9 : 11 }]}>
        {label ?? config.label}
      </Text>
    </View>
  );
}

export function GradeTagChip({ grade, label, style }: Props & { style?: object }) {
  const config = GRADE_CONFIG[grade];
  return (
    <View style={[styles.tagChip, { backgroundColor: config.bg }, style]}>
      <Text style={styles.tagText}>
        {grade} · {label ?? config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  letter: {
    backgroundColor: "#ffffff",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontFamily: "Inter_600SemiBold",
    color: "#000000",
  },
  label: {
    color: "#ffffff",
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
  },
  tagChip: {
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#000000",
  },
});
