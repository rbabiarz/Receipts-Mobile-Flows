import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface Props {
  label: string;
  onPress?: () => void;
  small?: boolean;
}

export function SuggestItem({ label, onPress, small = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text
        style={[
          styles.label,
          { fontSize: small ? 12 : 13 },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: "Inter_400Regular",
    letterSpacing: -0.1,
    color: "#000000",
    flex: 1,
  },
  arrow: {
    opacity: 0.4,
    fontSize: 13,
    marginLeft: 8,
  },
});
