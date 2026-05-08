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

import { GradeChip } from "@/components/GradeChip";
import { MonoLabel } from "@/components/MonoLabel";
import { useApp } from "@/context/AppContext";
import type { Topic } from "@/types";

const GRADE_ORDER = { A: 0, B: 1, C: 2, D: 3 };

export default function TopicsIndex() {
  const insets = useSafeAreaInsets();
  const { topics, followedTopics } = useApp();
  const [tab, setTab] = useState<"all" | "following">("all");

  const displayed = tab === "following"
    ? topics.filter((t) => followedTopics.includes(t.id))
    : [...topics].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
        ]}
      >
        <Text style={styles.title}>Topics</Text>
        <View style={styles.topBarRight}>
          <Pressable
            onPress={() => router.push("/(tabs)/topics/influencers")}
            style={styles.iconBtn}
          >
            <Text style={styles.iconBtnText}>People</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/topics/stacks")}
            style={styles.iconBtn}
          >
            <Text style={styles.iconBtnText}>Stacks</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(["all", "following"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text
              style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}
            >
              {t === "all" ? "All topics" : `Following (${followedTopics.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 80 + (Platform.OS === "web" ? 34 : 0) }}
      >
        {displayed.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No topics followed yet</Text>
            <Text style={styles.emptyBody}>
              Browse All topics and tap Follow on any that interest you.
            </Text>
          </View>
        ) : (
          displayed.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              isFollowed={followedTopics.includes(topic.id)}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/topics/[id]",
                  params: { id: topic.id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TopicRow({
  topic,
  isFollowed,
  onPress,
}: {
  topic: Topic;
  isFollowed: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.topicRow, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.topicLeft}>
        <View style={styles.topicNameRow}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          {isFollowed && <View style={styles.followedDot} />}
        </View>
        <Text style={styles.topicMeta}>
          {topic.paperCount} papers · {topic.contradictions} contradictions ·{" "}
          {topic.lastUpdated}
        </Text>
        {topic.contradictions > 0 && (
          <View style={styles.contraChip}>
            <Text style={styles.contraText}>
              {topic.contradictions} contradictions
            </Text>
          </View>
        )}
      </View>
      <View style={styles.topicRight}>
        <GradeChip grade={topic.grade} label={topic.gradeLabel} size="sm" />
        <Text style={styles.topicArrow}>→</Text>
      </View>
    </Pressable>
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
  title: { fontFamily: "Inter_600SemiBold", fontSize: 15, letterSpacing: -0.1 },
  topBarRight: { flexDirection: "row", gap: 6 },
  iconBtn: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  iconBtnText: { fontFamily: "Inter_500Medium", fontSize: 11 },
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
  tabBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#000000",
    letterSpacing: -0.1,
  },
  tabBtnTextActive: { color: "#ffffff" },
  scroll: { flex: 1 },
  topicRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 12,
  },
  topicLeft: { flex: 1, gap: 4 },
  topicNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  topicTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
  },
  followedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#c8e6cd",
    borderWidth: 1,
    borderColor: "#000000",
  },
  topicMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
  },
  contraChip: {
    backgroundColor: "#f3c9b6",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  contraText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  topicRight: { alignItems: "flex-end", gap: 6, paddingTop: 2 },
  topicArrow: { opacity: 0.35, fontSize: 12 },
  emptyState: {
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.72,
    textAlign: "center",
  },
});
