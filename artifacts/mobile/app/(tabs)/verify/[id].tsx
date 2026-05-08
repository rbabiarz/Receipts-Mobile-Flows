import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HeroBlock } from "@/components/HeroBlock";
import { MonoLabel } from "@/components/MonoLabel";
import { ReceiptRow } from "@/components/ReceiptRow";
import { useApp } from "@/context/AppContext";
import type { VerdictType } from "@/types";

const VERDICT_COLORS: Record<VerdictType, "lime" | "cream" | "coral"> = {
  supported: "lime",
  mixed: "cream",
  contradicted: "coral",
};

const VERDICT_LABELS: Record<VerdictType, string> = {
  supported: "Supported",
  mixed: "Mixed evidence",
  contradicted: "Contradicted",
};

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { verifyHistory } = useApp();

  const result = verifyHistory.find((v) => v.id === id);

  if (!result) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Verify</Text>
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Verify result not found.</Text>
        </View>
      </View>
    );
  }

  const color = VERDICT_COLORS[result.verdict];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Verify</Text>
        </Pressable>
        <MonoLabel>Receipt</MonoLabel>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 80 + (Platform.OS === "web" ? 34 : 0) }}
      >
        <HeroBlock
          color={color}
          style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 10 }}
        >
          <MonoLabel size={9}>{VERDICT_LABELS[result.verdict]}</MonoLabel>
          <Text style={styles.claimText}>{result.claim}</Text>
          {result.source && (
            <View style={styles.sourceChip}>
              <Text style={styles.sourceChipText}>{result.source}</Text>
            </View>
          )}
        </HeroBlock>

        {result.interpretation && (
          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 6 }}>Interpretation</MonoLabel>
            <Text style={styles.interpretText}>{result.interpretation}</Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: "#f7f7f5" }]}>
          <MonoLabel style={{ marginBottom: 6 }}>Verdict</MonoLabel>
          <Text style={styles.summaryText}>{result.summary}</Text>
        </View>

        {result.receipts.length > 0 && (
          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 4 }}>
              Receipts ({result.receipts.length})
            </MonoLabel>
            {result.receipts.map((r, i) => (
              <ReceiptRow key={r.id} receipt={r} index={i} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.disc}>
            {result.timestamp} · Receipts · Not medical advice
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  scroll: { flex: 1 },
  claimText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    letterSpacing: -0.26,
    lineHeight: 28,
    color: "#000000",
  },
  sourceChip: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  sourceChipText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  interpretText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
  },
  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
  },
  disc: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.55,
    lineHeight: 16,
    textAlign: "center",
  },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
});
