/**
 * Tokens aligned with workspace DESIGN.md (Figma editorial system).
 * @see /Users/rbabiarz/fintech/DESIGN.md
 */
import { StyleSheet } from "react-native";

export const designTokens = {
  colors: {
    primary: "#000000",
    onPrimary: "#ffffff",
    /** Destructive actions (remove, delete) — high contrast on white/canvas. */
    destructive: "#c62828",
    ink: "#000000",
    canvas: "#ffffff",
    hairline: "#e6e6e6",
    hairlineSoft: "#f1f1f1",
    surfaceSoft: "#f7f7f5",
    muted: "rgba(0,0,0,0.45)",
    blockLime: "#dceeb1",
    blockLilac: "#c5b0f4",
    blockCream: "#f4ecd6",
    blockMint: "#c8e6cd",
    blockCoral: "#f3c9b6",
    blockNavy: "#1f1d3d",
  },
  radii: {
    xs: 2,
    sm: 6,
    md: 8,
    lg: 24,
    pill: 50,
    full: 9999,
  },
  space: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
  },
} as const;

/** DESIGN.md `components.text-input`: canvas, body, md radius, 12×14 padding */
export const textFieldStyles = StyleSheet.create({
  input: {
    backgroundColor: designTokens.colors.canvas,
    color: designTokens.colors.ink,
    borderWidth: 1,
    borderColor: designTokens.colors.hairline,
    borderRadius: designTokens.radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
});
