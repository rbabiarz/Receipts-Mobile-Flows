import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
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

import { PillButton } from "@/components/PillButton";
import { SuggestItem } from "@/components/SuggestItem";
import { useApp } from "@/context/AppContext";

const TRENDING = [
  "Should I take taurine for longevity?",
  "Zone 2 vs HIIT for VO₂max — which evidence is stronger?",
  "Is the NMN hype justified?",
  "Berberine vs metformin — realistic effect sizes",
  "Magnesium threonate vs glycinate for sleep",
  "Does cold exposure actually increase testosterone?",
];

const RECENT_TOPICS = [
  "Creatine for cognition",
  "Rapamycin safety",
  "Time-restricted eating",
];

const SAFETY_PATTERNS = [
  "chest pain",
  "can't breathe",
  "shortness of breath",
  "crushing pain",
  "stroke",
  "bleeding",
];

export default function AskHome() {
  const insets = useSafeAreaInsets();
  const { savedAnswers, user } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  function isSafetyQuery(q: string) {
    return SAFETY_PATTERNS.some((p) => q.toLowerCase().includes(p));
  }

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSafetyQuery(trimmed)) {
      router.push("/safety");
      return;
    }
    router.push({
      pathname: "/(tabs)/ask/answer",
      params: { q: trimmed },
    });
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.topBar, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}
      >
        <Text style={styles.logo}>Receipts</Text>
        <View style={styles.topBarRight}>
          <Pressable
            onPress={() => router.push("/voice")}
            style={styles.iconBtn}
          >
            <Text style={styles.iconBtnText}>◎</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/you")}
            style={styles.avatarBtn}
          >
            <Text style={styles.avatarText}>{user.initials}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: 120 + (Platform.OS === "web" ? 34 : 0),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Ask the literature.</Text>
          <Text style={styles.heroSub}>
            Every answer is graded A–D, backed by receipts.
          </Text>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Ask</Text>
            <TextInput
              ref={inputRef}
              style={styles.inputText}
              value={query}
              onChangeText={setQuery}
              placeholder="Any health question…"
              placeholderTextColor="rgba(0,0,0,0.35)"
              returnKeyType="search"
              onSubmitEditing={() => submit(query)}
              multiline={false}
            />
          </View>
          <Pressable
            onPress={() => submit(query)}
            style={({ pressed }) => [
              styles.sendBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </Pressable>
        </View>

        {savedAnswers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Recent</Text>
            {savedAnswers.slice(0, 3).map((a) => (
              <SuggestItem
                key={a.id}
                label={a.question}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/ask/answer",
                    params: { q: a.question },
                  })
                }
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Trending</Text>
          {TRENDING.map((q) => (
            <SuggestItem
              key={q}
              label={q}
              onPress={() => submit(q)}
            />
          ))}
        </View>

        <View style={styles.pillRow}>
          {RECENT_TOPICS.map((t) => (
            <Pressable
              key={t}
              onPress={() => submit(`Tell me more about ${t}`)}
              style={styles.topicChip}
            >
              <Text style={styles.topicChipText}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {!user.isPremium && (
          <Pressable
            onPress={() => router.push("/premium")}
            style={styles.premiumBanner}
          >
            <Text style={styles.premiumBannerText}>
              Unlock premium — unlimited Verify, Voice, Weekly digest →
            </Text>
          </Pressable>
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
  logo: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    letterSpacing: -0.1,
  },
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#ffffff",
    letterSpacing: 0.4,
  },
  scroll: { flex: 1 },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  heroTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 28,
    letterSpacing: -0.96,
    lineHeight: 34,
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.78,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: { color: "#ffffff", fontSize: 16 },
  section: { paddingHorizontal: 18, paddingTop: 16, gap: 6 },
  sectionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  topicChip: {
    borderRadius: 50,
    backgroundColor: "#f7f7f5",
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  topicChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#000000",
    letterSpacing: -0.1,
  },
  premiumBanner: {
    marginHorizontal: 18,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: "#c5b0f4",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  premiumBannerText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#000000",
    lineHeight: 18,
  },
});
