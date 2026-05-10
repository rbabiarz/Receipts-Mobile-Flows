import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { getScreenTopPadding } from "@/constants/screenInsets";

type VoiceState = "idle" | "listening" | "processing" | "answer";

const TRANSCRIPT = '"What\'s the evidence on creatine for cognition in older adults…"';
const VOICE_ANSWER =
  "Multiple RCTs show creatine improves working memory and processing speed, especially under sleep deprivation and in vegetarians. Effect sizes are moderate. 3–5 g/day is well-tolerated. Grade A evidence overall.";

const SUGGESTIONS = [
  '"Is creatine safe long-term?"',
  '"What did Huberman say about taurine?"',
  '"Read me my Stack."',
];

export default function Voice() {
  const insets = useSafeAreaInsets();
  const shellPad = {
    paddingTop: getScreenTopPadding(insets.top),
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
  const [state, setState] = useState<VoiceState>("idle");
  const orbAnim = useRef(new Animated.Value(1)).current;
  const barAnims = useRef(Array.from({ length: 10 }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (state === "listening") {
      const animations = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 60),
            Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.2, duration: 300, useNativeDriver: true }),
          ])
        )
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    }
  }, [state]);

  useEffect(() => {
    if (state === "idle") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(orbAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [state]);

  async function startListening() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("listening");
  }

  async function done() {
    setState("processing");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((r) => setTimeout(r, 1800));
    setState("answer");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (state === "idle") {
    return (
      <View style={[styles.container, shellPad]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Voice</Text>
          </Pressable>
          <View style={styles.settingsBtn}>
            <Text style={styles.settingsText}>Settings</Text>
          </View>
        </View>
        <View style={styles.centerContent}>
          <Pressable onPress={startListening}>
            <Animated.View
              style={[styles.orb, { transform: [{ scale: orbAnim }] }]}
            >
              <Text style={styles.orbDot}>●</Text>
            </Animated.View>
          </Pressable>
          <Text style={styles.tapTitle}>Tap to ask.</Text>
          <Text style={styles.tapSubtitle}>
            Say anything. We'll ground in your library and read the answer back. Hands-free.
          </Text>
          <MonoLabel style={{ marginBottom: 8 }}>Try</MonoLabel>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s, i) => (
              <Pressable key={i} onPress={startListening} style={styles.suggestRow}>
                <Text style={styles.suggestText}>{s}</Text>
                <Text style={{ opacity: 0.4 }}>●</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (state === "listening") {
    return (
      <View style={[styles.container, shellPad]}>
        <View style={styles.header}>
          <Text style={styles.listeningTitle}>Listening</Text>
          <Text style={styles.listeningDot}>●</Text>
        </View>
        <View style={styles.centerContent}>
          <View style={styles.bars}>
            {barAnims.map((anim, i) => {
              const heights = [30, 60, 48, 72, 36, 54, 24, 40, 62, 28];
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height: heights[i],
                      transform: [{ scaleY: anim }],
                    },
                  ]}
                />
              );
            })}
          </View>
          <MonoLabel style={{ marginBottom: 6, marginTop: 24 }}>Transcribing</MonoLabel>
          <Text style={styles.transcript}>{TRANSCRIPT}</Text>
          <Text style={styles.privacyDisc}>
            Audio processed locally on iOS 26+. Full transcript saved only if you tap Save.
          </Text>
        </View>
        <View style={styles.bottomCta}>
          <PillButton label="Cancel" variant="light" onPress={() => setState("idle")} flex />
          <PillButton label="Done" onPress={done} flex />
        </View>
      </View>
    );
  }

  if (state === "processing") {
    return (
      <View style={[styles.container, shellPad]}>
        <View style={styles.centerContent}>
          <Text style={styles.processingText}>Researching…</Text>
          <Text style={styles.processingHint}>Grounding in your library</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, shellPad]}>
      <View style={styles.header}>
        <Pressable onPress={() => setState("idle")}>
          <Text style={styles.backBtn}>← Answer</Text>
        </Pressable>
        <Pressable style={styles.settingsBtn}>
          <Text style={styles.settingsText}>Save</Text>
        </Pressable>
      </View>
      <View style={styles.answerContent}>
        <MonoLabel style={{ marginBottom: 4 }}>Voice answer · Grade A</MonoLabel>
        <Text style={styles.answerText}>{VOICE_ANSWER}</Text>
        <Text style={styles.sourceLine}>6 sources · 14s · last reviewed 2026-04-18</Text>
        <View style={[styles.orb, styles.orbSmall, { backgroundColor: "#c8e6cd", marginTop: 24 }]}>
          <Text style={{ fontSize: 20 }}>▶</Text>
        </View>
        <Text style={[styles.tapTitle, { fontSize: 14, marginTop: 12 }]}>Playing</Text>
        <PillButton
          label="View full answer with receipts →"
          variant="light"
          style={{ marginTop: 24, borderColor: "#e6e6e6" }}
          onPress={() => router.back()}
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
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  settingsBtn: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  settingsText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#c5b0f4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  orbSmall: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 0,
  },
  orbDot: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  tapTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    letterSpacing: -0.26,
    marginBottom: 8,
    textAlign: "center",
  },
  tapSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.78,
    textAlign: "center",
    marginBottom: 24,
  },
  suggestions: { width: "100%", gap: 8 },
  suggestRow: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 80,
  },
  bar: {
    width: 8,
    backgroundColor: "#000000",
    borderRadius: 4,
  },
  transcript: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    letterSpacing: -0.26,
    lineHeight: 27,
    textAlign: "center",
    maxWidth: 300,
  },
  privacyDisc: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.55,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 24,
  },
  listeningTitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    opacity: 0.6,
  },
  listeningDot: { color: "#000000", fontSize: 10 },
  bottomCta: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === "web" ? 34 : 24,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
  },
  answerContent: {
    flex: 1,
    padding: 22,
    alignItems: "center",
  },
  answerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    marginTop: 8,
  },
  sourceLine: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 12,
  },
  processingText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 24,
    letterSpacing: -0.26,
  },
  processingHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    opacity: 0.62,
    marginTop: 8,
  },
});
