import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "@/components/PillButton";
import { useApp } from "@/context/AppContext";

export default function Premium() {
  const { upgradeToPremium } = useApp();
  const [upgraded, setUpgraded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 1200));
    await upgradeToPremium();
    setUpgraded(true);
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (upgraded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#c8e6cd" }]}>
        <View style={styles.confirmation}>
          <Text style={styles.welcomeEyebrow}>Welcome to premium</Text>
          <Text style={styles.welcomeTitle}>You're in.</Text>
          <Text style={styles.welcomeBody}>
            Receipt sent to your email. First charge $60 today, renews 2027-05-07. Cancel any time from Settings.
          </Text>
          <View style={[styles.tryCard, { marginTop: 24 }]}>
            <Text style={styles.tryLabel}>Try these now</Text>
            {[
              "Verify a claim — no daily limit",
              "Schedule your Monday digest",
              "Unlock unlimited Stack protocols",
              "Connect your own LLM (coming soon)",
            ].map((item, i) => (
              <Pressable key={i} style={styles.tryRow}>
                <Text style={styles.tryText}>{item}</Text>
                <Text style={{ opacity: 0.4 }}>→</Text>
              </Pressable>
            ))}
          </View>
          <PillButton
            label="Back to Receipts"
            onPress={() => router.replace("/(tabs)/ask")}
            style={{ marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.pricingTitle}>$60 a year. That's it.</Text>
        <Text style={styles.pricingSubtitle}>
          No tiers. No add-ons. No "essentials" upsell on top. We don't sell supplements — this is how we keep the lights on.
        </Text>

        <View style={styles.premiumCard}>
          <Text style={styles.premiumEyebrow}>Premium</Text>
          <Text style={styles.premiumPrice}>
            $60<Text style={styles.premiumPer}> /yr</Text>
          </Text>
          {[
            "Unlimited Verify",
            "Unlimited Stack + n=1 history",
            "Weekly digest on followed topics",
            "Contradiction alerts on your protocols",
            "Personal Direct Data API",
            "Voice surface",
            "Custom agent / prompt builder",
          ].map((f, i) => (
            <Text key={i} style={styles.featureItem}>
              ● {f}
            </Text>
          ))}
        </View>

        <Text style={styles.freeLabel}>Stays free, always</Text>
        <View style={styles.freeCard}>
          {[
            "Search and Ask.",
            "All 200 curated topic pages.",
            "5 Verifies/day.",
            "Stack with up to 5 active protocols.",
            "Citations. Always. Forever.",
          ].map((f, i) => (
            <View key={i} style={styles.freeItem}>
              <Text style={styles.freeBullet}>●</Text>
              <Text style={styles.freeText}>{f}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomCta}>
        <PillButton
          label="Maybe later"
          variant="light"
          onPress={() => router.back()}
          flex
        />
        <PillButton
          label="Upgrade · $60"
          onPress={handleUpgrade}
          loading={loading}
          flex
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  scroll: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  pricingTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 28,
    letterSpacing: -0.96,
    lineHeight: 34,
    marginBottom: 8,
  },
  pricingSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.78,
    marginBottom: 16,
  },
  premiumCard: {
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#c5b0f4",
    marginBottom: 16,
    gap: 8,
  },
  premiumEyebrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.72,
  },
  premiumPrice: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 40,
    letterSpacing: -0.96,
    lineHeight: 44,
  },
  premiumPer: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    opacity: 0.7,
  },
  featureItem: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  freeLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
    marginBottom: 8,
  },
  freeCard: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  freeItem: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  freeBullet: { opacity: 0.55, fontSize: 8, marginTop: 4 },
  freeText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 18 },
  bottomCta: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === "web" ? 34 : 24,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
  },
  confirmation: {
    flex: 1,
    padding: 22,
    paddingTop: 56,
  },
  welcomeEyebrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.72,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 34,
    letterSpacing: -0.96,
    lineHeight: 38,
    marginBottom: 10,
  },
  welcomeBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.85,
  },
  tryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    gap: 0,
  },
  tryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
    marginBottom: 8,
  },
  tryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  tryText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
});
