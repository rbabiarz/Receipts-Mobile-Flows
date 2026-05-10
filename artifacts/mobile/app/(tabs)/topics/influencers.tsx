import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MonoLabel } from "@/components/MonoLabel";
import { HeroBlock } from "@/components/HeroBlock";
import { PillButton } from "@/components/PillButton";
import { ReceiptRow } from "@/components/ReceiptRow";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";
import type { Creator, VerdictType } from "@/types";

const VERDICT_COLORS: Record<VerdictType, string> = {
  supported: "#c8e6cd",
  mixed: "#f4ecd6",
  contradicted: "#f3c9b6",
};

export default function Influencers() {
  const insets = useSafeAreaInsets();
  const { creators } = useApp();
  const [selected, setSelected] = useState<Creator | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  if (selectedClaim !== null && selected) {
    const claim = selected.claims.find((c) => c.id === selectedClaim);
    if (claim) {
      return (
        <View style={styles.container}>
          <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
            <Pressable onPress={() => setSelectedClaim(null)}>
              <Text style={styles.backBtn}>← {selected.name}</Text>
            </Pressable>
            <MonoLabel>Claim detail</MonoLabel>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <HeroBlock
              color={claim.verdict === "supported" ? "mint" : claim.verdict === "mixed" ? "cream" : "coral"}
              style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 8 }}
            >
              <View style={[styles.verdictBadge, { backgroundColor: VERDICT_COLORS[claim.verdict] }]}>
                <Text style={styles.verdictBadgeText}>{claim.verdict}</Text>
              </View>
              <Text style={styles.claimQuote}>"{claim.quote}"</Text>
              <MonoLabel size={9}>{claim.episode}</MonoLabel>
            </HeroBlock>
            {claim.receipts.length > 0 && (
              <View style={styles.section}>
                <MonoLabel style={{ marginBottom: 4 }}>Receipts ({claim.receipts.length})</MonoLabel>
                {claim.receipts.map((r, i) => (
                  <ReceiptRow key={r.id} receipt={r} index={i} />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }
  }

  if (selected) {
    const calibratedPct = Math.round((selected.calibrated / selected.claimCount) * 100);
    const mixedPct = Math.round((selected.mixed / selected.claimCount) * 100);
    const unsupportedPct = Math.round((selected.unsupported / selected.claimCount) * 100);

    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
          <Pressable onPress={() => setSelected(null)}>
            <Text style={styles.backBtn}>← Influencers</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <HeroBlock color="lilac" style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 6 }}>
            <MonoLabel size={9}>{selected.platform} · {selected.claimCount} claims tracked</MonoLabel>
            <Text style={styles.creatorName}>{selected.name}</Text>
            <Text style={styles.creatorHandle}>@{selected.handle}</Text>
            <View style={styles.calibrationBar}>
              <View style={[styles.barSegment, { flex: calibratedPct, backgroundColor: "#c8e6cd" }]} />
              <View style={[styles.barSegment, { flex: mixedPct, backgroundColor: "#f4ecd6" }]} />
              <View style={[styles.barSegment, { flex: unsupportedPct, backgroundColor: "#f3c9b6" }]} />
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendItem}>{calibratedPct}% calibrated</Text>
              <Text style={styles.legendItem}>{mixedPct}% mixed</Text>
              <Text style={styles.legendItem}>{unsupportedPct}% unsupported</Text>
            </View>
          </HeroBlock>

          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 8 }}>Recent claims</MonoLabel>
            {selected.claims.map((claim) => (
              <Pressable
                key={claim.id}
                style={styles.claimRow}
                onPress={() => setSelectedClaim(claim.id)}
              >
                <View style={[styles.claimDot, { backgroundColor: VERDICT_COLORS[claim.verdict] }]} />
                <View style={styles.claimContent}>
                  <Text style={styles.claimQuoteShort} numberOfLines={2}>
                    "{claim.quote}"
                  </Text>
                  <Text style={styles.claimMeta}>
                    {claim.episode} · {claim.date}
                  </Text>
                </View>
                <Text style={styles.claimArrow}>→</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Topics</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Influencer Map</Text>
      </View>

      <View style={styles.desc}>
        <Text style={styles.descText}>
          We track claims made by popular health influencers and score them against primary literature. No editorializing — just evidence.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 + (Platform.OS === "web" ? 34 : 0) }}>
        {creators.map((c) => {
          const calibratedPct = Math.round((c.calibrated / c.claimCount) * 100);
          const mixedPct = Math.round((c.mixed / c.claimCount) * 100);
          const unsupportedPct = Math.round((c.unsupported / c.claimCount) * 100);

          return (
            <Pressable
              key={c.id}
              style={styles.creatorRow}
              onPress={() => setSelected(c)}
            >
              <View style={styles.creatorAvatar}>
                <Text style={styles.creatorAvatarText}>
                  {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </Text>
              </View>
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorRowName}>{c.name}</Text>
                <Text style={styles.creatorRowMeta}>
                  {c.claimCount} claims · {c.platform}
                </Text>
                <View style={styles.calibrationBarSmall}>
                  <View style={[styles.barSegmentSmall, { flex: calibratedPct, backgroundColor: "#c8e6cd" }]} />
                  <View style={[styles.barSegmentSmall, { flex: mixedPct, backgroundColor: "#f4ecd6" }]} />
                  <View style={[styles.barSegmentSmall, { flex: unsupportedPct, backgroundColor: "#f3c9b6" }]} />
                </View>
                <Text style={styles.calibLabel}>{calibratedPct}% calibrated</Text>
              </View>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>
          );
        })}
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
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  desc: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    backgroundColor: "#f7f7f5",
  },
  descText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.78,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 12,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  creatorAvatarText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#ffffff",
  },
  creatorInfo: { flex: 1, gap: 3 },
  creatorRowName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  creatorRowMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
  },
  calibrationBarSmall: {
    flexDirection: "row",
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  },
  barSegmentSmall: { height: 5 },
  calibLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    opacity: 0.62,
    marginTop: 2,
  },
  rowArrow: { opacity: 0.35 },
  creatorName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  creatorHandle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    opacity: 0.72,
  },
  calibrationBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  barSegment: { height: 8 },
  legendRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  legendItem: { fontFamily: "Inter_400Regular", fontSize: 10, opacity: 0.85 },
  section: { paddingHorizontal: 18, paddingVertical: 14 },
  claimRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 10,
  },
  claimDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3, flexShrink: 0 },
  claimContent: { flex: 1 },
  claimQuote: { fontFamily: "Inter_600SemiBold", fontSize: 17, letterSpacing: -0.2, lineHeight: 24 },
  claimQuoteShort: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 19 },
  claimMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 3,
  },
  claimArrow: { opacity: 0.35, paddingTop: 2 },
  verdictBadge: {
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  verdictBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "uppercase" },
});
