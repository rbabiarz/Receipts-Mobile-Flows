import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type BlockColor = "lilac" | "lime" | "cream" | "mint" | "coral" | "pink" | "navy";

interface Props {
  color: BlockColor;
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

const BG: Record<BlockColor, string> = {
  lilac: "#c5b0f4",
  lime: "#dceeb1",
  cream: "#f4ecd6",
  mint: "#c8e6cd",
  coral: "#f3c9b6",
  pink: "#efd4d4",
  navy: "#1f1d3d",
};

export function HeroBlock({ color, children, style, padded = true }: Props) {
  return (
    <View
      style={[
        styles.block,
        { backgroundColor: BG[color] },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: "hidden",
  },
  padded: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});
