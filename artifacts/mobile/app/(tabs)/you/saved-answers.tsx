import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradeChip } from "@/components/GradeChip";
import { MonoLabel } from "@/components/MonoLabel";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";

export default function SavedAnswersScreen() {
  const insets = useSafeAreaInsets();
  const { savedAnswers } = useApp();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.backBtn}>← You</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Saved answers</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40 + (Platform.OS === "web" ? 34 : 0),
        }}
      >
        {savedAnswers.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyBody}>
              From an answer, tap Save to keep it here and in Recent on Ask.
            </Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace("/(tabs)/ask");
              }}
            >
              <Text style={styles.emptyCtaText}>Go to Ask →</Text>
            </Pressable>
          </View>
        ) : (
          savedAnswers.map((a) => (
            <Pressable
              key={a.id}
              style={({ pressed }) => [
                styles.row,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/(tabs)/ask/answer",
                  params: { q: a.question },
                });
              }}
            >
              <View style={styles.rowTop}>
                <GradeChip grade={a.grade} label={a.gradeLabel} />
                <MonoLabel size={9}>{a.timestamp.slice(0, 10)}</MonoLabel>
              </View>
              <Text style={styles.question} numberOfLines={2}>
                {a.question}
              </Text>
              <Text style={styles.headline} numberOfLines={2}>
                {a.headline}
              </Text>
            </Pressable>
          ))
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
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  empty: {
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.72,
    textAlign: "center",
    maxWidth: 320,
  },
  emptyCta: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    backgroundColor: "#000000",
  },
  emptyCtaText: {
    color: "#ffffff",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  row: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 6,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  question: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
  },
  headline: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.72,
  },
});
