import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradeChip, GradeTagChip } from "@/components/GradeChip";
import { HeroBlock } from "@/components/HeroBlock";
import { LoaderStage } from "@/components/LoaderStage";
import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { ReceiptRow } from "@/components/ReceiptRow";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";
import type { Answer, GradeLevel, Receipt } from "@/types";

const REASONING_STAGES = [
  { label: "Parsing question" },
  { label: "Scoping inclusion criteria" },
  { label: "Screening 1,847 candidate papers" },
  { label: "Extracting effect sizes" },
  { label: "Scoring conflicts" },
  { label: "Drafting answer" },
];

const MOCK_ANSWERS: Record<string, Partial<Answer>> = {
  default: {
    grade: "B" as GradeLevel,
    gradeLabel: "Moderate",
    headline:
      "Moderate evidence supports taurine for cardiometabolic markers — animal longevity data is striking but not yet replicated in humans.",
    summary:
      "The 2023 Singh et al. Science paper showed dramatic healthspan and lifespan benefits in mice and worms. The best human data is a meta-analysis of 12 RCTs showing modest reductions in blood pressure (~3 mmHg systolic) and triglycerides — both real, neither dramatic. No human longevity RCT exists yet. Well-tolerated at 1–6 g/day. Mechanism is plausible (mitochondrial function, membrane stabilization, osmoregulation).",
    takeaways: [
      "Animal data is compelling; human translation is not established.",
      "Best effect in people with hypertension or cardiometabolic risk.",
      "3 RCTs running now — TAUR-AGE, CARDIOTAU, LIFESPAN-T.",
      "2 g/day is the most common dosing in positive human trials.",
      "No major safety signal at doses up to 6 g/day.",
    ],
    receipts: [
      {
        id: "r1",
        title: "Taurine deficiency drives aging",
        cite: "Singh · Science · 2023 · Mouse/worm · n=250",
        grade: "D" as GradeLevel,
        studyType: "Animal",
        tags: ["D · Animal", "Replicated"],
        plainEnglish:
          "Mice with lower taurine aged faster; supplementing extended lifespan ~10%.",
        qualityFlags: ["High-impact journal", "Multi-species"],
        whyMatters: "The paper that made taurine famous. Mechanistic signal strong.",
        fundingFlag: "NIH funded",
      },
      {
        id: "r2",
        title: "Taurine + cardiometabolic risk factors — meta",
        cite: "Guan · Adv Nutr · 2024 · Meta · 12 RCTs",
        grade: "B" as GradeLevel,
        studyType: "Meta-analysis",
        tags: ["B · Meta", "Heterogeneity"],
        plainEnglish:
          "Meta of 12 RCTs: SBP −3 mmHg, triglycerides down. Heterogeneity high.",
        qualityFlags: ["Preregistered", "12 RCTs"],
        whyMatters: "Best human evidence. Modest but consistent.",
      },
      {
        id: "r3",
        title: "Endothelial function in prehypertensives",
        cite: "Sun · Hypertens Res · 2016 · RCT · n=120",
        grade: "B" as GradeLevel,
        studyType: "RCT",
        tags: ["B · RCT"],
        plainEnglish:
          "12 weeks of 1.6 g/day taurine improved endothelial function vs placebo.",
      },
    ] as Receipt[],
    contradictions: 2,
    sourceCount: 31,
    duration: "14s",
  },
};

type Stage = "reasoning" | "answer";

export default function AnswerScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const insets = useSafeAreaInsets();
  const { addAnswer } = useApp();

  const [stage, setStage] = useState<Stage>("reasoning");
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);

  const answerData: Partial<Answer> = MOCK_ANSWERS.default;

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step >= REASONING_STAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          setStage("answer");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 400);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  function handleAddToStack() {
    router.push({
      pathname: "/(tabs)/ask/add-to-stack",
      params: { from: q ?? "" },
    });
  }

  const handleSave = useCallback(async () => {
    if (saveBusy) return;
    setSaveBusy(true);
    try {
      const answer: Answer = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        question: q ?? "",
        grade: answerData.grade!,
        gradeLabel: answerData.gradeLabel!,
        headline: answerData.headline!,
        summary: answerData.summary!,
        takeaways: answerData.takeaways!,
        receipts: answerData.receipts!,
        contradictions: answerData.contradictions!,
        timestamp: new Date().toISOString(),
        duration: answerData.duration!,
        sourceCount: answerData.sourceCount!,
      };
      await addAnswer(answer);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaveBusy(false);
    }
  }, [
    addAnswer,
    answerData.contradictions,
    answerData.duration,
    answerData.grade,
    answerData.gradeLabel,
    answerData.headline,
    answerData.receipts,
    answerData.sourceCount,
    answerData.summary,
    answerData.takeaways,
    q,
  ]);

  if (stage === "reasoning") {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { paddingTop: getScreenTopPadding(insets.top) },
          ]}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Ask</Text>
          </Pressable>
          <MonoLabel>Researching</MonoLabel>
        </View>
        <View style={styles.questionBand}>
          <MonoLabel style={{ marginBottom: 4 }}>Question</MonoLabel>
          <Text style={styles.questionText}>{q}</Text>
        </View>
        <View style={styles.loaderBlock}>
          <HeroBlock color="lilac" style={{ borderRadius: 12, padding: 16 }}>
            <MonoLabel style={{ marginBottom: 8, color: "#000000" }}>
              Reasoning loop
            </MonoLabel>
            {REASONING_STAGES.map((s, i) => (
              <LoaderStage
                key={i}
                state={
                  i < currentStep ? "done" : i === currentStep ? "active" : "pending"
                }
                label={s.label}
                meta={i < currentStep ? "✓" : undefined}
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
          { paddingTop: getScreenTopPadding(insets.top) },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Ask</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <MonoLabel style={styles.headerMeta}>
            {answerData.sourceCount} sources · {answerData.duration}
          </MonoLabel>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }}
      >
        <HeroBlock color="lime" style={styles.gradeHero}>
          <GradeChip grade={answerData.grade!} label={answerData.gradeLabel} />
          <Text style={styles.headline}>{answerData.headline}</Text>
          <Text style={styles.questionSmall}>{q}</Text>
        </HeroBlock>

        <View style={styles.summarySection}>
          <MonoLabel style={{ marginBottom: 8 }}>Summary</MonoLabel>
          <Text style={styles.summaryText}>{answerData.summary}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.takeawaysSection}>
          <MonoLabel style={{ marginBottom: 8 }}>Key takeaways</MonoLabel>
          {answerData.takeaways!.map((t, i) => (
            <View key={i} style={styles.takeawayRow}>
              <Text style={styles.takeawayNum}>{i + 1}</Text>
              <Text style={styles.takeawayText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.receiptsSection}>
          <View style={styles.receiptHeader}>
            <MonoLabel>
              Receipts ({answerData.receipts!.length})
            </MonoLabel>
            {answerData.contradictions! > 0 && (
              <View style={styles.contraChip}>
                <Text style={styles.contraText}>
                  {answerData.contradictions} contradictions
                </Text>
              </View>
            )}
          </View>
          {answerData.receipts!.map((r, i) => (
            <View key={r.id}>
              <ReceiptRow
                receipt={r}
                index={i}
                onPress={() =>
                  setExpandedReceipt(expandedReceipt === r.id ? null : r.id)
                }
              />
              {expandedReceipt === r.id && (
                <View style={styles.receiptExpanded}>
                  {r.plainEnglish && (
                    <>
                      <MonoLabel size={9} style={{ marginBottom: 4 }}>
                        Plain english
                      </MonoLabel>
                      <Text style={styles.expandedText}>{r.plainEnglish}</Text>
                    </>
                  )}
                  {r.whyMatters && (
                    <>
                      <MonoLabel size={9} style={{ marginTop: 8, marginBottom: 4 }}>
                        Why it matters
                      </MonoLabel>
                      <Text style={styles.expandedText}>{r.whyMatters}</Text>
                    </>
                  )}
                  {r.fundingFlag && (
                    <Text style={styles.fundingFlag}>{r.fundingFlag}</Text>
                  )}
                  {r.qualityFlags && r.qualityFlags.length > 0 && (
                    <View style={styles.flagsRow}>
                      {r.qualityFlags.map((f, fi) => (
                        <View key={fi} style={styles.flagChip}>
                          <Text style={styles.flagText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            Educational summary · not medical advice · sources linked in-app
          </Text>
          <Pressable
            style={styles.feedbackRow}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
          >
            <Text style={styles.feedbackLabel}>
              Was this graded correctly?
            </Text>
            <View style={styles.feedbackBtns}>
              <Pressable style={styles.feedbackBtn}>
                <Text style={styles.feedbackBtnText}>Too high</Text>
              </Pressable>
              <Pressable style={styles.feedbackBtn}>
                <Text style={styles.feedbackBtnText}>Too low</Text>
              </Pressable>
              <Pressable style={styles.feedbackBtn}>
                <Text style={styles.feedbackBtnText}>Right</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 12 },
        ]}
      >
        <PillButton
          label="Save"
          variant="light"
          onPress={() => void handleSave()}
          loading={saveBusy}
          flex
        />
        <PillButton
          label="Add to Stack →"
          onPress={handleAddToStack}
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginLeft: 12,
  },
  headerMeta: { textAlign: "right" },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  questionBand: {
    backgroundColor: "#f7f7f5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  questionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#000000",
    lineHeight: 18,
  },
  loaderBlock: { padding: 16 },
  scroll: { flex: 1 },
  gradeHero: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
  },
  headline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    letterSpacing: -0.2,
    lineHeight: 24,
    color: "#000000",
  },
  questionSmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.72,
    marginTop: 4,
  },
  summarySection: { paddingHorizontal: 18, paddingVertical: 14 },
  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#000000",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#e6e6e6",
    marginHorizontal: 18,
  },
  takeawaysSection: { paddingHorizontal: 18, paddingVertical: 14 },
  takeawayRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f1",
  },
  takeawayNum: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
    paddingTop: 1,
    width: 16,
  },
  takeawayText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  receiptsSection: { paddingHorizontal: 18, paddingVertical: 14 },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  contraChip: {
    backgroundColor: "#f3c9b6",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  contraText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#000000",
  },
  receiptExpanded: {
    backgroundColor: "#f7f7f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  expandedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "#000000",
  },
  fundingFlag: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 6,
  },
  flagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  flagChip: {
    borderRadius: 50,
    backgroundColor: "#c8e6cd",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  flagText: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  disclaimerSection: { paddingHorizontal: 18, paddingVertical: 14 },
  disclaimerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.55,
    lineHeight: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  feedbackRow: {
    gap: 8,
    alignItems: "flex-start",
  },
  feedbackLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.62,
    marginBottom: 6,
    textAlign: "left",
    width: "100%",
  },
  feedbackBtns: { flexDirection: "row", gap: 6 },
  feedbackBtn: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  feedbackBtnText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  bottomBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
    backgroundColor: "#ffffff",
    ...(Platform.OS === "web"
      ? ({ zIndex: 2 } as const)
      : {}),
  },
});
