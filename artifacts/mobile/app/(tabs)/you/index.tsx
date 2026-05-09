import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
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
import { PillButton } from "@/components/PillButton";
import { useApp } from "@/context/AppContext";
import type { DetailLevel, EvidenceFloor, ToneType } from "@/types";

const DETAIL_OPTS: { key: DetailLevel; label: string; desc: string }[] = [
  { key: "gist", label: "Gist", desc: "~80 words, top takeaways only" },
  { key: "full", label: "Full", desc: "~200 words, all receipts" },
  { key: "max", label: "Max + always cite", desc: "~400 words, effect sizes, CIs" },
];

const TONE_OPTS: { key: ToneType; label: string }[] = [
  { key: "direct", label: "Direct" },
  { key: "encouraging", label: "Encouraging" },
  { key: "facts", label: "Just the facts" },
];

const FLOOR_OPTS: { key: EvidenceFloor; label: string; desc: string }[] = [
  { key: "a_only", label: "A only", desc: "Only show Grade A evidence" },
  { key: "a_to_c", label: "A–C", desc: "A through C (recommended)" },
  { key: "all", label: "All", desc: "Everything including animal data" },
];

const SOURCES = [
  { id: "pubmed", label: "PubMed", on: true },
  { id: "cochrane", label: "Cochrane", on: true },
  { id: "biorxiv", label: "bioRxiv (preprints)", on: true },
  { id: "nsf", label: "NSF funded only", on: false },
];

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, myStack, savedAnswers, verifyHistory } = useApp();
  const [section, setSection] = useState<"home" | "personalization" | "sources" | "data">("home");
  const [sources, setSources] = useState(SOURCES);

  function toggleSource(id: string) {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, on: !s.on } : s))
    );
    Haptics.selectionAsync();
  }

  if (section === "personalization") {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
          <Pressable onPress={() => setSection("home")}>
            <Text style={styles.backBtn}>← You</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Personalization</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 10 }}>Detail level</MonoLabel>
            {DETAIL_OPTS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => { setUser({ detailLevel: opt.key }); Haptics.selectionAsync(); }}
                style={[styles.optRow, user.detailLevel === opt.key && styles.optRowActive]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optLabel}>{opt.label}{user.detailLevel === opt.key ? " ✓" : ""}</Text>
                  <Text style={styles.optDesc}>{opt.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 10 }}>Tone</MonoLabel>
            <View style={styles.pillRow}>
              {TONE_OPTS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => { setUser({ tone: opt.key }); Haptics.selectionAsync(); }}
                  style={[styles.tonePill, user.tone === opt.key && styles.tonePillActive]}
                >
                  <Text style={[styles.tonePillText, user.tone === opt.key && styles.tonePillTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 10 }}>Evidence floor</MonoLabel>
            {FLOOR_OPTS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => { setUser({ evidenceFloor: opt.key }); Haptics.selectionAsync(); }}
                style={[styles.optRow, user.evidenceFloor === opt.key && styles.optRowActive]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.optLabel}>{opt.label}{user.evidenceFloor === opt.key ? " ✓" : ""}</Text>
                  <Text style={styles.optDesc}>{opt.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (section === "sources") {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
          <Pressable onPress={() => setSection("home")}>
            <Text style={styles.backBtn}>← You</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Source library</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.sourceDesc}>
            <Text style={styles.sourceDescText}>
              Control which databases and filters Receipts uses when building your answers.
            </Text>
          </View>
          {sources.map((s) => (
            <Pressable key={s.id} onPress={() => toggleSource(s.id)} style={styles.sourceRow}>
              <Text style={styles.sourceLabel}>{s.label}</Text>
              <View style={[styles.toggle, s.on && styles.toggleOn]}>
                <View style={[styles.toggleDot, s.on && styles.toggleDotOn]} />
              </View>
            </Pressable>
          ))}
          <View style={{ padding: 18 }}>
            <MonoLabel size={9} style={{ lineHeight: 16, textAlign: "center" }}>
              Changes apply to new searches only · preprint warning always shown
            </MonoLabel>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (section === "data") {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
          <Pressable onPress={() => setSection("home")}>
            <Text style={styles.backBtn}>← You</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Data & export</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 8 }}>Your data</MonoLabel>
            {[
              { label: "Saved answers", count: savedAnswers.length },
              { label: "Stack protocols", count: myStack.length },
              { label: "Verify history", count: verifyHistory.length },
            ].map((item) => (
              <View key={item.label} style={styles.dataRow}>
                <Text style={styles.dataLabel}>{item.label}</Text>
                <Text style={styles.dataCount}>{item.count} items</Text>
              </View>
            ))}
          </View>
          <View style={styles.section}>
            <PillButton label="Export all data (JSON) →" variant="light" onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert("Export started", "Your data export will be ready in a moment.");
            }} />
          </View>
          <View style={[styles.section, { borderTopWidth: 4, borderTopColor: "#f7f7f5" }]}>
            <MonoLabel style={{ marginBottom: 8, color: "#f3c9b6" }}>Danger zone</MonoLabel>
            <PillButton
              label="Delete account and all data"
              variant="danger"
              onPress={() =>
                Alert.alert(
                  "Delete account",
                  "This will permanently delete your account, Stack, Verify history, and all saved data. This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete everything", style: "destructive", onPress: () => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      Alert.alert("Account deleted", "All data has been permanently removed.");
                    }},
                  ]
                )
              }
            />
            <Text style={[styles.dataLabel, { opacity: 0.55, fontSize: 11, marginTop: 8, lineHeight: 16 }]}>
              Immediate and permanent. Not reversible. No backup.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        <Text style={styles.title}>You</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 80 + (Platform.OS === "web" ? 34 : 0) }}
      >
        <HeroBlock color="navy" style={{ paddingHorizontal: 18, paddingVertical: 20, gap: 6 }}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <Text style={[styles.emailText, { color: "#ffffff", opacity: 0.85 }]}>{user.email}</Text>
          <Text style={[styles.joinDate, { color: "#ffffff", opacity: 0.55 }]}>
            Member since {user.joinedAt.split("-")[0]}
          </Text>
          {user.isPremium ? (
            <View style={[styles.premiumBadge, { marginTop: 6, alignSelf: "flex-start" }]}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push("/premium")}
              style={styles.upgradeInline}
            >
              <Text style={styles.upgradeInlineText}>Upgrade · $60/yr →</Text>
            </Pressable>
          )}
        </HeroBlock>

        <View style={styles.statsRow}>
          {[
            { label: "Answers saved", value: savedAnswers.length },
            { label: "Stack protocols", value: myStack.length },
            { label: "Verifies done", value: verifyHistory.length },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBlock}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuSection}>
          {[
            {
              label: "Personalization",
              meta: `${user.detailLevel} · ${user.tone}`,
              onPress: () => setSection("personalization"),
            },
            {
              label: "Source library",
              meta: "PubMed, Cochrane, bioRxiv",
              onPress: () => setSection("sources"),
            },
            {
              label: "Data & export",
              meta: "Export, delete, API access",
              onPress: () => setSection("data"),
            },
            {
              label: "Voice settings",
              meta: "Speed, language, auto-play",
              onPress: () => router.push("/voice"),
            },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuMeta}>{item.meta}</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.legalText}>
            Receipts is an educational tool · not medical advice · always consult a qualified clinician
          </Text>
          <Text style={styles.legalText}>v1.0.0 · data as of 2026-05-01</Text>
        </View>
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
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15, letterSpacing: -0.1 },
  premiumBadge: {
    backgroundColor: "#c5b0f4",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#000000" },
  scroll: { flex: 1 },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#000000" },
  emailText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  joinDate: { fontFamily: "Inter_400Regular", fontSize: 11 },
  upgradeInline: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  upgradeInlineText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#ffffff" },
  statsRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRightWidth: 0.5,
    borderRightColor: "#e6e6e6",
  },
  statValue: { fontFamily: "Inter_600SemiBold", fontSize: 22, letterSpacing: -0.3 },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.62,
    textAlign: "center",
    marginTop: 2,
  },
  menuSection: { paddingHorizontal: 18, paddingTop: 14 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 12,
  },
  menuLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#000000" },
  menuMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 2,
  },
  menuArrow: { opacity: 0.35, fontSize: 14 },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  legalText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.55,
    lineHeight: 16,
    textAlign: "center",
  },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  optRowActive: { borderColor: "#000000", borderWidth: 2, backgroundColor: "#c5b0f4" },
  optLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  optDesc: { fontFamily: "Inter_400Regular", fontSize: 11, opacity: 0.72, marginTop: 2 },
  pillRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tonePill: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tonePillActive: { backgroundColor: "#000000", borderColor: "#000000" },
  tonePillText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#000000" },
  tonePillTextActive: { color: "#ffffff" },
  sourceDesc: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#f7f7f5",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  sourceDescText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18, opacity: 0.78 },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    justifyContent: "space-between",
  },
  sourceLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e6e6e6",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: "#000000" },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
  },
  toggleDotOn: { alignSelf: "flex-end" },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f1",
  },
  dataLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  dataCount: { fontFamily: "Inter_500Medium", fontSize: 13, opacity: 0.72 },
});
