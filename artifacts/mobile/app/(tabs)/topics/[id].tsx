import { router, useLocalSearchParams } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Chip } from "@/components/Chip";
import { GradeChip } from "@/components/GradeChip";
import { HeroBlock } from "@/components/HeroBlock";
import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { ReceiptRow } from "@/components/ReceiptRow";
import { useApp } from "@/context/AppContext";

type TabType = "overview" | "contradictions";

export default function TopicDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { topics, followedTopics, toggleFollowTopic } = useApp();
  const [tab, setTab] = useState<TabType>("overview");

  const topic = topics.find((t) => t.id === id);
  const isFollowed = followedTopics.includes(id ?? "");

  if (!topic) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Topics</Text>
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Topic not found.</Text>
        </View>
      </View>
    );
  }

  async function handleFollow() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFollowTopic(topic!.id);
  }

  const gradeBlockColor: Record<string, "lime" | "mint" | "cream" | "coral"> = {
    A: "mint",
    B: "lime",
    C: "cream",
    D: "coral",
  };
  const blockColor = gradeBlockColor[topic.grade] ?? "cream";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Topics</Text>
        </Pressable>
        <Pressable onPress={handleFollow}>
          <View
            style={[
              styles.followBtn,
              isFollowed && styles.followBtnActive,
            ]}
          >
            <Text
              style={[
                styles.followBtnText,
                isFollowed && styles.followBtnTextActive,
              ]}
            >
              {isFollowed ? "Following ✓" : "Follow"}
            </Text>
          </View>
        </Pressable>
      </View>

      <HeroBlock color={blockColor} style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 8 }}>
        <MonoLabel size={9}>
          {topic.paperCount} papers · Updated {topic.lastUpdated}
        </MonoLabel>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <GradeChip grade={topic.grade} label={topic.gradeLabel} />
      </HeroBlock>

      <View style={styles.tabRow}>
        {(["overview", "contradictions"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text
              style={[
                styles.tabBtnText,
                tab === t && styles.tabBtnTextActive,
              ]}
            >
              {t === "overview"
                ? "Overview"
                : `Contradictions (${topic.contradictions})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }}
      >
        {tab === "overview" ? (
          <>
            <View style={styles.section}>
              <MonoLabel style={{ marginBottom: 8 }}>Summary</MonoLabel>
              <Text style={styles.summaryText}>{topic.summary}</Text>
            </View>

            {topic.openQuestions.length > 0 && (
              <View style={styles.section}>
                <MonoLabel style={{ marginBottom: 8 }}>Open questions</MonoLabel>
                {topic.openQuestions.map((q, i) => (
                  <View key={i} style={styles.questionRow}>
                    <Text style={styles.questionNum}>{i + 1}</Text>
                    <Text style={styles.questionText}>{q}</Text>
                  </View>
                ))}
              </View>
            )}

            {topic.keyPapers.length > 0 && (
              <View style={styles.section}>
                <MonoLabel style={{ marginBottom: 4 }}>
                  Key papers ({topic.keyPapers.length})
                </MonoLabel>
                {topic.keyPapers.map((r, i) => (
                  <ReceiptRow key={r.id} receipt={r} index={i} />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/ask/answer",
                    params: { q: `Tell me about the latest evidence on ${topic.title}` },
                  })
                }
                style={styles.askBtn}
              >
                <Text style={styles.askBtnText}>
                  Ask Receipts about {topic.title} →
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            {topic.contradictions === 0 ? (
              <View style={styles.noContradictions}>
                <Text style={styles.noContraTitle}>No active contradictions</Text>
                <Text style={styles.noContraBody}>
                  The literature on this topic is largely consistent right now. Receipts monitors for new conflicting evidence weekly.
                </Text>
              </View>
            ) : (
              topic.contradictionDetails.map((c, i) => (
                <View key={i} style={styles.contraCard}>
                  <Text style={styles.contraCardTitle}>{c.title}</Text>
                  <Text style={styles.contraCardDesc}>{c.description}</Text>
                  <View style={styles.contraChips}>
                    {c.chips.map((chip, ci) => (
                      <Chip key={ci} label={chip} variant="outline" />
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}
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
  followBtn: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  followBtnActive: { backgroundColor: "#000000", borderColor: "#000000" },
  followBtnText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  followBtnTextActive: { color: "#ffffff" },
  topicTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  tabBtn: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  tabBtnActive: { backgroundColor: "#000000", borderColor: "#000000" },
  tabBtnText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  tabBtnTextActive: { color: "#ffffff" },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#000000",
  },
  questionRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f1",
  },
  questionNum: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
    paddingTop: 2,
    width: 16,
  },
  questionText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
  askBtn: {
    backgroundColor: "#000000",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: "center",
  },
  askBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#ffffff" },
  contraCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 6,
  },
  contraCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 18 },
  contraCardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.85,
  },
  contraChips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  noContradictions: { padding: 32, alignItems: "center", gap: 8 },
  noContraTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  noContraBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.72,
    textAlign: "center",
  },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
});
