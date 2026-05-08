import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Receipt } from "@/types";
import { Chip } from "./Chip";
import { GradeTagChip } from "./GradeChip";

interface Props {
  receipt: Receipt;
  index: number;
  ord?: string;
  onPress?: () => void;
  hideChips?: boolean;
}

function chipVariantForTag(tag: string) {
  if (tag.startsWith("A")) return "mint" as const;
  if (tag.startsWith("B")) return "lime" as const;
  if (tag.startsWith("C")) return "cream" as const;
  if (tag.startsWith("D")) return "coral" as const;
  return "outline" as const;
}

export function ReceiptRow({ receipt, index, ord, onPress, hideChips }: Props) {
  const ordLabel = ord ?? String(index + 1).padStart(2, "0");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={styles.ord}>{ordLabel}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{receipt.title}</Text>
        <Text style={styles.cite}>{receipt.cite}</Text>
        {!hideChips && receipt.tags.length > 0 && (
          <View style={styles.chips}>
            {receipt.tags.map((tag, i) => (
              <Chip
                key={i}
                label={tag}
                variant={chipVariantForTag(tag)}
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    gap: 8,
  },
  ord: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.55,
    paddingTop: 2,
    width: 22,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#000000",
    lineHeight: 18,
  },
  cite: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 2,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 5,
  },
});
