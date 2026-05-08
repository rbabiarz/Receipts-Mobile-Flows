import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { useApp } from "@/context/AppContext";
import type { VerdictType } from "@/types";

const VERDICT_COLORS: Record<VerdictType, string> = {
  supported: "#c8e6cd",
  mixed: "#f4ecd6",
  contradicted: "#f3c9b6",
};

const VERDICT_LABELS: Record<VerdictType, string> = {
  supported: "Supported",
  mixed: "Mixed",
  contradicted: "Contradicted",
};

export default function VerifyHome() {
  const insets = useSafeAreaInsets();
  const { verifyHistory, verifyUsedToday, user } = useApp();
  const [claim, setClaim] = useState("");

  const freeLimit = 5;
  const remaining = Math.max(0, freeLimit - verifyUsedToday);
  const isAtLimit = !user.isPremium && remaining === 0;

  function handleVerify() {
    if (!claim.trim()) return;
    if (isAtLimit) {
      router.push("/premium");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(tabs)/verify/checking",
      params: { claim: claim.trim() },
    });
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
          },
        ]}
      >
        <Text style={styles.title}>Verify</Text>
        {!user.isPremium && (
          <Pressable onPress={() => router.push("/premium")}>
            <View style={styles.limitChip}>
              <Text style={styles.limitText}>
                {remaining}/{freeLimit} left
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.explainer}>
          <Text style={styles.explainerTitle}>
            Paste a claim. Get a verdict.
          </Text>
          <Text style={styles.explainerBody}>
            Send us any health claim — podcast quote, headline, influencer post. We score it against the primary literature.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <MonoLabel style={{ marginBottom: 6 }}>Claim</MonoLabel>
          <View style={styles.inputArea}>
            <TextInput
              style={styles.inputText}
              value={claim}
              onChangeText={setClaim}
              placeholder={`"Cold exposure boosts testosterone significantly."`}
              placeholderTextColor="rgba(0,0,0,0.35)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.sourceRow}>
            <MonoLabel size={9}>Source (optional)</MonoLabel>
            <TextInput
              style={styles.sourceInput}
              placeholder="Podcast, Instagram, article…"
              placeholderTextColor="rgba(0,0,0,0.35)"
            />
          </View>
        </View>

        {isAtLimit && (
          <Pressable
            style={styles.limitBanner}
            onPress={() => router.push("/premium")}
          >
            <Text style={styles.limitBannerTitle}>
              5 free Verifies used today
            </Text>
            <Text style={styles.limitBannerBody}>
              Upgrade to premium for unlimited. $60/yr — no tiers, no add-ons.
            </Text>
            <Text style={styles.limitBannerCta}>Upgrade →</Text>
          </Pressable>
        )}

        <View style={styles.actions}>
          <PillButton
            label={isAtLimit ? "Upgrade to Verify" : "Verify this claim →"}
            onPress={handleVerify}
            disabled={!claim.trim() && !isAtLimit}
            flex
          />
        </View>

        {verifyHistory.length > 0 && (
          <View style={styles.historySection}>
            <MonoLabel style={{ marginBottom: 8 }}>History</MonoLabel>
            {verifyHistory.map((v) => (
              <Pressable
                key={v.id}
                style={styles.historyRow}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/verify/[id]",
                    params: { id: v.id },
                  })
                }
              >
                <View
                  style={[
                    styles.verdictDot,
                    { backgroundColor: VERDICT_COLORS[v.verdict] },
                  ]}
                />
                <View style={styles.historyContent}>
                  <Text style={styles.historyClaim} numberOfLines={2}>
                    {v.claim}
                  </Text>
                  <Text style={styles.historyMeta}>
                    {VERDICT_LABELS[v.verdict]} · {v.timestamp}
                  </Text>
                </View>
                <Text style={styles.historyArrow}>→</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    letterSpacing: -0.1,
  },
  limitChip: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  limitText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  scroll: { flex: 1 },
  explainer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  explainerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    letterSpacing: -0.26,
    lineHeight: 28,
    marginBottom: 6,
  },
  explainerBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.78,
  },
  inputSection: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  inputArea: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    minHeight: 90,
  },
  inputText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#000000",
    lineHeight: 22,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
    paddingTop: 10,
  },
  sourceInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#000000",
  },
  limitBanner: {
    margin: 18,
    borderRadius: 10,
    backgroundColor: "#f4ecd6",
    padding: 14,
    gap: 4,
  },
  limitBannerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#000000",
  },
  limitBannerBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.85,
  },
  limitBannerCta: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  historySection: { paddingHorizontal: 18, paddingTop: 16 },
  historyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  verdictDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
    flexShrink: 0,
  },
  historyContent: { flex: 1 },
  historyClaim: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 18,
    color: "#000000",
  },
  historyMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 3,
  },
  historyArrow: { opacity: 0.35, paddingTop: 2 },
});
