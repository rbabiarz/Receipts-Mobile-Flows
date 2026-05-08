import React from "react";
import { StyleSheet, Text, View } from "react-native";

type StageState = "done" | "active" | "pending";

interface Props {
  state: StageState;
  label: string;
  meta?: string;
}

export function LoaderStage({ state, label, meta }: Props) {
  const iconBg =
    state === "done"
      ? "#c8e6cd"
      : state === "active"
      ? "#c5b0f4"
      : "#f7f7f5";

  const icon =
    state === "done" ? "✓" : state === "active" ? "●" : "○";

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: iconBg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.label,
          { fontFamily: state === "active" ? "Inter_600SemiBold" : "Inter_400Regular" },
        ]}
      >
        {label}
      </Text>
      {meta && <Text style={styles.meta}>{meta}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    borderStyle: "dashed",
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#000000",
  },
  label: {
    fontSize: 13,
    color: "#000000",
    flex: 1,
  },
  meta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.6,
  },
});
