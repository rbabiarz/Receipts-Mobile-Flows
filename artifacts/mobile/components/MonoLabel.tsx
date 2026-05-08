import React from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: TextStyle;
  opacity?: number;
  size?: number;
}

export function MonoLabel({ children, style, opacity = 0.62, size = 10 }: Props) {
  return (
    <Text
      style={[
        styles.base,
        { opacity, fontSize: size },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#000000",
  },
});
