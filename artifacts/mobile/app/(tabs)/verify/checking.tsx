import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
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
import { LoaderStage } from "@/components/LoaderStage";
import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { ReceiptRow } from "@/components/ReceiptRow";
import { useApp } from "@/context/AppContext";
import type { GradeLevel, Receipt, VerifyResult, VerdictType } from "@/types";

const STAGES = [
  { label: "Parsing claim structure" },
  { label: "Identifying PICO components" },
  { label: "Screening 2,312 candidate papers" },
  { label: "Applying inclusion criteria" },
  { label: "Scoring evidence quality" },
  { label: "Generating verdict" },
];

type Screen = "loading" | "verdict";

const MOCK_RECEIPTS: Receipt[] = [
  {
    id: "v-r1",
    title: "Taurine supplementation and blood pressure — systematic review",
    cite: "Guan · Adv Nutr · 2024 · Meta · 12 RCTs",
    grade: "B" as GradeLevel,
    studyType: "Meta-analysis",
    tags: ["B · Meta"],
    plainEnglish:
      "12 RCTs: systolic BP −3 mmHg, triglycerides down. Heterogeneity was high.",
    qualityFlags: ["Preregistered", "12 RCTs"],
  },
  {
    id: "v-r2",
    title: "Taurine and cardiometabolic risk in prehypertensive adults",
    cite: "Sun · Hypertens Res · 2016 · RCT · n=120",
    grade: "B" as GradeLevel,
    studyType: "RCT",
    tags: ["B · RCT"],
    plainEnglish: "Modest BP reduction, improved endothelial function.",
  },
  {
    id: "v-r3",
    title: "No effect on BP in normotensive healthy adults",
    cite: "Miller · JPEN · 2020 · RCT · n=44",
    grade: "B" as GradeLevel,
    studyType: "RCT",
    tags: ["B · RCT"],
    plainEnglish: "In healthy adults with normal BP, no significant effect.",
  },
];

export default function Checking() {
  const { claim } = useLocalSearchParams<{ claim: string }>();
  const insets = useSafeAreaInsets();
  const { addVerify } = useApp();

  const [screen, setScreen] = useState<Screen>("loading");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let step = 0;
    const iv = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step >= STAGES.length) {
        clearInterval(iv);
        setTimeout(() => {
          const result: VerifyResult = {
            id: Date.now().toString(),
            claim: claim ?? "",
            verdict: "mixed" as VerdictType,
            source: "Manual entry",
            interpretation:
              "Taurine lowers blood pressure — specifically cardiometabolic risk markers in people with elevated BP.",
            summary:
              "Supported in people with elevated BP (≥130/80) — meta of 12 RCTs shows modest SBP reduction (~3 mmHg) and lower triglycerides. Not replicated in healthy normotensive adults. Effect size is real but modest. Longevity claim not testable in humans yet.",
            receipts: MOCK_RECEIPTS,
            timestamp: "just now",
          };
          addVerify(result);
          setScreen("verdict");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 400);
      }
    }, 380);
    return () => clearInterval(iv);
  }, []);

  if (screen === "loading") {
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
          <MonoLabel>Checking</MonoLabel>
        </View>
        <View style={styles.claimBand}>
          <MonoLabel size={9} style={{ marginBottom: 4 }}>
            Claim
          </MonoLabel>
          <Text style={styles.claimText}>{claim}</Text>
        </View>
        <View style={{ padding: 16 }}>
          <HeroBlock color="cream" style={{ borderRadius: 12, padding: 16 }}>
            <MonoLabel style={{ marginBottom: 8 }}>Parsing claim</MonoLabel>
            {STAGES.map((s, i) => (
              <LoaderStage
                key={i}
                state={
                  i < currentStep ? "done" : i === currentStep ? "active" : "pending"
                }
                label={s.label}
              />
            ))}
          </HeroBlock>
        </View>
      </View>
    );
  }

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
        <MonoLabel>Verdict</MonoLabel>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }}
      >
        <HeroBlock color="cream" style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 8 }}>
          <View style={styles.verdictBadge}>
            <View style={[styles.verdictDot, { backgroundColor: "#f4ecd6" }]} />
            <Text style={styles.verdictLabel}>Mixed evidence</Text>
          </View>
          <Text style={styles.claimQuote}>{claim}</Text>
        </HeroBlock>

        <View style={styles.section}>
          <MonoLabel style={{ marginBottom: 6 }}>Interpretation</MonoLabel>
          <Text style={styles.interpretText}>
            "Taurine lowers blood pressure — specifically cardiometabolic risk markers in people with elevated BP."
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: "#f7f7f5", borderRadius: 0 }]}>
          <MonoLabel style={{ marginBottom: 6 }}>Verdict</MonoLabel>
          <Text style={styles.verdictSummary}>
            Supported in people with elevated BP (≥130/80) — meta of 12 RCTs shows modest SBP reduction (~3 mmHg) and lower triglycerides. Not replicated in healthy normotensive adults. Effect size is real but modest. Longevity claim not testable in humans yet.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.receiptsHeader}>
            <MonoLabel>Receipts ({MOCK_RECEIPTS.length})</MonoLabel>
            <View style={[styles.contraChip, { backgroundColor: "#f4ecd6" }]}>
              <Text style={styles.contraText}>1 contradiction</Text>
            </View>
          </View>
          {MOCK_RECEIPTS.map((r, i) => (
            <ReceiptRow key={r.id} receipt={r} index={i} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.disc}>
            Verdict is based on published literature as of 2026-04-30. Not medical advice.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 12 }]}>
        <PillButton
          label="Done"
          variant="light"
          onPress={() => router.replace("/(tabs)/verify")}
          flex
        />
        <PillButton
          label="Save receipt →"
          onPress={() => router.replace("/(tabs)/verify")}
          flex
        />
      </View>
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
  claimBand: {
    backgroundColor: "#f7f7f5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  claimText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#000000",
    lineHeight: 18,
  },
  scroll: { flex: 1 },
  verdictBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verdictDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000000",
  },
  verdictLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#000000",
  },
  claimQuote: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
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
    color: "#000000",
    fontStyle: "italic",
  },
  verdictSummary: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#000000",
  },
  receiptsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  contraChip: {
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  contraText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#000000",
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
  bottomBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
    backgroundColor: "#ffffff",
  },
});
