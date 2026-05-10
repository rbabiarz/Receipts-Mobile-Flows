import { router, useLocalSearchParams } from "expo-router";
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

import { GradeChip } from "@/components/GradeChip";
import { HeroBlock } from "@/components/HeroBlock";
import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { designTokens } from "@/constants/designTokens";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";

type TabType = "protocol" | "readout";

const STATUS_BLOCK: Record<string, "mint" | "lilac" | "cream" | "pink"> = {
  running: "mint",
  trial: "lilac",
  paused: "cream",
  done: "pink",
};

const webPressable =
  Platform.OS === "web" ? ({ cursor: "pointer" } as const) : {};

export default function ProtocolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { myStack, updateProtocol, removeProtocol } = useApp();
  const [tab, setTab] = useState<TabType>("protocol");

  const protocol = myStack.find((p) => p.id === id);

  if (!protocol) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Stack</Text>
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Protocol not found.</Text>
        </View>
      </View>
    );
  }

  const blockColor = STATUS_BLOCK[protocol.status] ?? "cream";

  function handlePause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateProtocol(protocol!.id, {
      status: protocol!.status === "paused" ? "running" : "paused",
    });
  }

  function handleRemove() {
    const p = protocol!;
    const message = `Remove "${p.name}" from your Stack?`;

    const runRemove = async () => {
      await removeProtocol(p.id);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      router.back();
    };

    if (Platform.OS === "web") {
      if (typeof globalThis !== "undefined" && globalThis.confirm(message)) {
        void runRemove();
      }
      return;
    }

    Alert.alert("Remove protocol", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => void runRemove(),
      },
    ]);
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
          <Text style={styles.backBtn}>← Stack</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable
            onPress={handlePause}
            style={({ pressed }) => [
              styles.menuBtn,
              webPressable,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={styles.menuBtnText}>
              {protocol.status === "paused" ? "Resume" : "Pause"}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleRemove}
            style={({ pressed }) => [
              styles.menuBtn,
              webPressable,
              { opacity: pressed ? 0.75 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Remove protocol from stack"
          >
            <Text
              style={[styles.menuBtnText, styles.menuBtnTextDestructive]}
              selectable={false}
            >
              Remove
            </Text>
          </Pressable>
        </View>
      </View>

      <HeroBlock
        color={blockColor}
        style={{ paddingHorizontal: 18, paddingVertical: 16, gap: 6 }}
      >
        <MonoLabel size={9}>
          {protocol.status} · Started {protocol.startDate}
        </MonoLabel>
        <Text style={styles.protocolTitle}>{protocol.name}</Text>
        <View style={styles.heroChips}>
          <GradeChip grade={protocol.evidence} label="Evidence" size="sm" />
          {protocol.adherence !== undefined && (
            <View style={styles.adherenceChip}>
              <Text style={styles.adherenceText}>
                {protocol.adherence}% adherence
              </Text>
            </View>
          )}
        </View>
      </HeroBlock>

      {protocol.readoutAvailable && (
        <View style={styles.tabRow}>
          {(["protocol", "readout"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t === "protocol" ? "Protocol" : "n=1 Readout"}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }}
      >
        {tab === "readout" && protocol.readoutAvailable ? (
          <ReadoutTab protocol={protocol} onPausePress={handlePause} />
        ) : (
          <ProtocolTab protocol={protocol} />
        )}
      </ScrollView>
    </View>
  );
}

function ProtocolTab({ protocol }: { protocol: ReturnType<typeof useApp>["myStack"][0] }) {
  return (
    <>
      <View style={styles.fieldGrid}>
        {[
          { label: "Dose", value: protocol.dose },
          { label: "Timing", value: protocol.timing },
          { label: "Duration", value: protocol.duration },
          { label: "Washout", value: protocol.washout },
          { label: "Outcome", value: protocol.outcome },
          { label: "Source", value: protocol.source },
        ]
          .filter((f) => !!f.value)
          .map((f) => (
            <View key={f.label} style={styles.fieldRow}>
              <MonoLabel size={9} style={{ width: 60 }}>
                {f.label}
              </MonoLabel>
              <Text style={styles.fieldValue}>{f.value}</Text>
            </View>
          ))}
      </View>

      {protocol.hypothesis && (
        <View style={styles.section}>
          <MonoLabel style={{ marginBottom: 6 }}>Hypothesis</MonoLabel>
          <Text style={styles.hypothesisText}>{protocol.hypothesis}</Text>
        </View>
      )}

      {protocol.timeline.length > 0 && (
        <View style={styles.section}>
          <MonoLabel style={{ marginBottom: 8 }}>Timeline</MonoLabel>
          {protocol.timeline.map((event, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineDotCol}>
                <View style={styles.timelineDot} />
                {i < protocol.timeline.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{event.title}</Text>
                <Text style={styles.timelineDetail}>{event.detail}</Text>
                <Text style={styles.timelineDate}>{event.date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function ReadoutTab({
  protocol,
  onPausePress,
}: {
  protocol: ReturnType<typeof useApp>["myStack"][0];
  onPausePress: () => void;
}) {
  return (
    <>
      <HeroBlock color="cream" style={{ paddingHorizontal: 18, paddingVertical: 16, gap: 8 }}>
        <MonoLabel size={9}>n=1 Readout · Week 12</MonoLabel>
        <Text style={styles.readoutTitle}>
          Fasting glucose improved. ApoB unchanged. Continue?
        </Text>
      </HeroBlock>

      <View style={styles.section}>
        <MonoLabel style={{ marginBottom: 8 }}>Outcome tracker</MonoLabel>
        {protocol.baselineValue && (
          <View style={styles.outcomeRow}>
            <View style={styles.outcomeBlock}>
              <MonoLabel size={9}>Baseline</MonoLabel>
              <Text style={styles.outcomeValue}>{protocol.baselineValue}</Text>
              <Text style={styles.outcomeUnit}>{protocol.baselineUnit ?? ""}</Text>
            </View>
            <Text style={styles.outcomeDivider}>→</Text>
            <View style={styles.outcomeBlock}>
              <MonoLabel size={9}>Current</MonoLabel>
              <Text style={[styles.outcomeValue, { color: "#000000" }]}>
                {protocol.currentValue ?? "—"}
              </Text>
              <Text style={styles.outcomeUnit}>{protocol.baselineUnit ?? ""}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <MonoLabel style={{ marginBottom: 8 }}>Interpretation</MonoLabel>
        <Text style={styles.interpText}>
          Your fasting glucose dropped 7 mg/dL — consistent with the RCT mean effect (−5–10 mg/dL). ApoB didn't change, which aligns with the null result in cardiovascular endpoints from Sun 2016. Grade B evidence matched your outcome.
        </Text>
      </View>

      <View style={styles.section}>
        <MonoLabel style={{ marginBottom: 8 }}>What the evidence says for next steps</MonoLabel>
        {[
          "Continue if tolerating well — 12 more weeks to observe ApoB.",
          "Test HbA1c to confirm insulin sensitivity improvement.",
          "Check for GI side effects — 8% of RCT participants reported nausea.",
        ].map((item, i) => (
          <View key={i} style={styles.nextRow}>
            <Text style={styles.nextNum}>{i + 1}</Text>
            <Text style={styles.nextText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { flexDirection: "row", gap: 8 }]}>
        <PillButton label="Continue protocol" flex onPress={() => {}} />
        <PillButton
          label={protocol.status === "paused" ? "Resume" : "Pause"}
          variant="light"
          flex
          onPress={onPausePress}
        />
      </View>
    </>
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
  headerRight: { flexDirection: "row", gap: 8 },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  menuBtn: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  menuBtnText: { fontFamily: "Inter_500Medium", fontSize: 11, color: "#000000" },
  menuBtnTextDestructive: { color: designTokens.colors.destructive },
  protocolTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    letterSpacing: -0.26,
    lineHeight: 26,
  },
  heroChips: { flexDirection: "row", gap: 8, alignItems: "center" },
  adherenceChip: {
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adherenceText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
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
  fieldGrid: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 0,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f1",
  },
  fieldValue: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, color: "#000000" },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  hypothesisText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    color: "#000000",
  },
  timelineRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 8,
  },
  timelineDotCol: { alignItems: "center", width: 16 },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000000",
    marginTop: 4,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: "#e6e6e6",
    marginTop: 4,
    minHeight: 20,
  },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 18 },
  timelineDetail: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, opacity: 0.78 },
  timelineDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.55,
    marginTop: 2,
  },
  readoutTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  outcomeBlock: { alignItems: "center", gap: 2 },
  outcomeValue: { fontFamily: "Inter_600SemiBold", fontSize: 28, letterSpacing: -0.5 },
  outcomeUnit: { fontFamily: "Inter_400Regular", fontSize: 10, opacity: 0.62 },
  outcomeDivider: { fontFamily: "Inter_400Regular", fontSize: 16, opacity: 0.5 },
  interpText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  nextRow: { flexDirection: "row", gap: 10, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#f1f1f1" },
  nextNum: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.55,
    paddingTop: 2,
    width: 16,
  },
  nextText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, flex: 1 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
});
