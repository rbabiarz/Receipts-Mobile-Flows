import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "@/components/PillButton";
import { useApp } from "@/context/AppContext";

const ALL_TOPICS = [
  "Longevity",
  "Sleep",
  "Gut health",
  "Cognition",
  "Hormones",
  "Metabolic",
  "Cardio",
  "Strength + recovery",
  "Stress",
  "Nutrition",
  "Supplements",
  "Skin + hair",
  "Fertility",
  "Cold + heat",
  "Fasting",
];

type DetailLevel = "gist" | "full" | "max";

export default function Onboarding() {
  const { setHasOnboarded, setUser } = useApp();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Longevity",
    "Sleep",
    "Cognition",
    "Metabolic",
    "Supplements",
  ]);
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("full");

  function toggleTopic(t: string) {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
    Haptics.selectionAsync();
  }

  async function finish() {
    await setUser({ email: email || "user@example.com", topics: selectedTopics, detailLevel });
    await setHasOnboarded(true);
    router.replace("/(tabs)/ask");
  }

  function next() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  }

  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.splashContent}>
          <View>
            <Text style={styles.eyebrow}>Receipts</Text>
            <Text style={styles.splashTitle}>Show me the receipts.</Text>
            <Text style={styles.splashSubtitle}>
              A research agent for longevity-curious adults. Ask any health question, get a graded answer, drill into the primary literature.
            </Text>
          </View>
          <View style={styles.splashActions}>
            <PillButton label="Create account" onPress={next} flex />
            <PillButton label="I already have one" variant="light" onPress={next} flex />
            <Text style={styles.disc}>
              Educational tool · not medical advice · no supplement revenue ever
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.stepHeader}>
            <Pressable onPress={() => setStep(0)}>
              <Text style={styles.backBtn}>← Back</Text>
            </Pressable>
            <Text style={styles.stepCount}>1 / 4</Text>
          </View>
          <ScrollView style={styles.body} contentContainerStyle={{ gap: 16 }}>
            <Text style={styles.stepTitle}>What's your email?</Text>
            <Text style={styles.stepSub}>
              We'll send you a sign-in code. Passkey on next step.
            </Text>
            <View style={styles.inputBar}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.inputText}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="rgba(0,0,0,0.35)"
              />
            </View>
            <View style={styles.socialRow}>
              {["Apple", "Google", "Passkey"].map((p) => (
                <View key={p} style={styles.socialPill}>
                  <Text style={styles.socialText}>{p}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.sectionLabel}>What we'll do with this</Text>
            <View style={styles.takeaways}>
              {[
                "Sign you in. That's it.",
                "Never sold. Never shared. Never advertised against.",
                "One-tap export and one-tap deletion in Settings.",
              ].map((item, i) => (
                <View key={i} style={styles.takeawayItem}>
                  <Text style={styles.takeawayBullet}>●</Text>
                  <Text style={styles.takeawayText}>{item}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.bottomCta}>
            <PillButton label="Send code" onPress={next} flex />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stepHeader}>
          <Pressable onPress={() => setStep(1)}>
            <Text style={styles.backBtn}>← Back</Text>
          </Pressable>
          <Text style={styles.stepCount}>2 / 4</Text>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.stepTitle}>What do you want receipts on?</Text>
          <Text style={styles.stepSub}>
            Pick what's interesting. Personalizes your home suggestions and your weekly digest.
          </Text>
          <View style={styles.topicGrid}>
            {ALL_TOPICS.map((t) => {
              const selected = selectedTopics.includes(t);
              return (
                <Pressable
                  key={t}
                  onPress={() => toggleTopic(t)}
                  style={[
                    styles.topicPill,
                    selected && styles.topicPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.topicText,
                      selected && styles.topicTextSelected,
                    ]}
                  >
                    {selected ? `${t} ✓` : t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.sectionLabel}>
            {selectedTopics.length} selected · suggested 4–8
          </Text>
        </ScrollView>
        <View style={styles.bottomCta}>
          <PillButton label="Skip" variant="light" onPress={next} flex />
          <PillButton label="Continue" onPress={next} flex />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 3) {
    const levels: { key: DetailLevel; title: string; words: string; desc: string; selected?: boolean }[] = [
      {
        key: "gist",
        title: "Gist",
        words: "~80 words",
        desc: "Verdict, key takeaways, top 2 receipts. Headlines without the math.",
      },
      {
        key: "full",
        title: "Full",
        words: "~200 words",
        desc: "Verdict, takeaways, top 4–6 receipts, contradictions surfaced. Recommended.",
      },
      {
        key: "max",
        title: "Max + always cite",
        words: "~400 words",
        desc: "Everything. Effect sizes, CIs, mechanism notes, every receipt inline.",
      },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stepHeader}>
          <Pressable onPress={() => setStep(2)}>
            <Text style={styles.backBtn}>← Back</Text>
          </Pressable>
          <Text style={styles.stepCount}>3 / 4</Text>
        </View>
        <ScrollView style={styles.body} contentContainerStyle={{ gap: 10, paddingBottom: 100 }}>
          <Text style={styles.stepTitle}>How deep do you want to go?</Text>
          <Text style={styles.stepSub}>
            Three levels. Editable any time. Affects how much detail Receipts shows by default.
          </Text>
          {levels.map((l) => {
            const isSelected = detailLevel === l.key;
            return (
              <Pressable
                key={l.key}
                onPress={() => {
                  setDetailLevel(l.key);
                  Haptics.selectionAsync();
                }}
                style={[
                  styles.levelCard,
                  isSelected && styles.levelCardSelected,
                ]}
              >
                <View style={styles.levelHeader}>
                  <Text style={styles.levelTitle}>
                    {l.title}{isSelected ? " ✓" : ""}
                  </Text>
                  <Text style={styles.levelWords}>{l.words}</Text>
                </View>
                <Text style={[styles.levelDesc, !isSelected && { opacity: 0.78 }]}>
                  {l.desc}
                </Text>
              </Pressable>
            );
          })}
          <Text style={styles.disc}>
            FK readability ≤ 9 enforced at every level — we translate, we don't dumb down.
          </Text>
        </ScrollView>
        <View style={styles.bottomCta}>
          <PillButton label="Back" variant="light" onPress={() => setStep(2)} flex />
          <PillButton label="Continue" onPress={next} flex />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={styles.backBtn}>Try Receipts</Text>
        <Text style={styles.stepCount}>4 / 4</Text>
      </View>
      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.stepTitle}>Ask your first question.</Text>
        <Text style={styles.stepSub}>
          Free tier covers unlimited search and 5 Verifies a day. Citations are never paywalled.
        </Text>
        <Text style={[styles.sectionLabel, { marginTop: 16, marginBottom: 8 }]}>Try one of these</Text>
        {[
          "Should I take creatine for cognition?",
          "Is mouth-taping safe?",
          "Magnesium glycinate vs threonate",
          "Zone 2 vs HIIT for VO₂max",
        ].map((q) => (
          <Pressable
            key={q}
            onPress={finish}
            style={styles.suggestRow}
          >
            <Text style={styles.suggestText}>{q}</Text>
            <Text style={{ opacity: 0.4 }}>→</Text>
          </Pressable>
        ))}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Or ask anything</Text>
        <View style={styles.inputBar}>
          <Text style={styles.inputLabel}>Ask</Text>
          <Text style={{ opacity: 0.45, fontSize: 13, flex: 1 }}>Type a question…</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomCta}>
        <PillButton label="Skip — explore later" variant="light" onPress={finish} flex />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  splashContent: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    paddingTop: 56,
  },
  eyebrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
  },
  splashTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 36,
    letterSpacing: -0.96,
    lineHeight: 40,
    marginTop: 12,
    marginBottom: 16,
  },
  splashSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.78,
    letterSpacing: -0.14,
  },
  splashActions: { gap: 10 },
  disc: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.55,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 8,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  backBtn: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    opacity: 0.6,
  },
  stepCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
  },
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    letterSpacing: -0.26,
    lineHeight: 30,
    marginBottom: 8,
  },
  stepSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.78,
    marginBottom: 16,
  },
  inputBar: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.55,
  },
  inputText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#000000",
  },
  socialRow: { flexDirection: "row", gap: 8 },
  socialPill: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  socialText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: -0.1,
  },
  sectionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
    marginBottom: 8,
  },
  takeaways: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  takeawayItem: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  takeawayBullet: { opacity: 0.55, fontSize: 8 },
  takeawayText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 18 },
  topicGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  topicPill: {
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  topicPillSelected: { backgroundColor: "#000000" },
  topicText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#000000",
    letterSpacing: -0.1,
  },
  topicTextSelected: { color: "#ffffff" },
  levelCard: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    padding: 14,
  },
  levelCardSelected: {
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#c5b0f4",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  levelTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#000000",
  },
  levelWords: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
  },
  levelDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  suggestRow: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  suggestText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
    color: "#000000",
  },
  bottomCta: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === "web" ? 34 : 24,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
  },
});
