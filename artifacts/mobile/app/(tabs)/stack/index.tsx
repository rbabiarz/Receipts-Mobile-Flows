import { router } from "expo-router";
import React from "react";
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
import { PillButton } from "@/components/PillButton";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";
import type { Protocol, StackStatus } from "@/types";

const STATUS_CONFIG: Record<
  StackStatus,
  { label: string; bg: string; dot: string }
> = {
  running: { label: "Running", bg: "#c8e6cd", dot: "#000000" },
  trial: { label: "Trial", bg: "#c5b0f4", dot: "#000000" },
  paused: { label: "Paused", bg: "#efefea", dot: "#737373" },
  done: { label: "Done", bg: "#f7f7f5", dot: "#737373" },
};

export default function StackHome() {
  const insets = useSafeAreaInsets();
  const { myStack } = useApp();

  const running = myStack.filter((p) => p.status === "running" || p.status === "trial");
  const inactive = myStack.filter((p) => p.status === "paused" || p.status === "done");

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          { paddingTop: getScreenTopPadding(insets.top) },
        ]}
      >
        <Text style={styles.title}>My Stack</Text>
        <MonoLabel>{myStack.length} protocols</MonoLabel>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === "web" ? 34 : 0) }}
      >
        {running.length > 0 && (
          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 6 }}>Active</MonoLabel>
            {running.map((p) => (
              <ProtocolRow key={p.id} protocol={p} />
            ))}
          </View>
        )}

        {inactive.length > 0 && (
          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 6 }}>Inactive</MonoLabel>
            {inactive.map((p) => (
              <ProtocolRow key={p.id} protocol={p} />
            ))}
          </View>
        )}

        {myStack.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your Stack is empty</Text>
            <Text style={styles.emptyBody}>
              Ask a health question and add any evidence-backed answer to your Stack.
            </Text>
            <PillButton
              label="Ask your first question →"
              onPress={() => router.push("/(tabs)/ask")}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ProtocolRow({ protocol }: { protocol: Protocol }) {
  const status = STATUS_CONFIG[protocol.status];
  const hasReadout = !!protocol.readoutAvailable;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/(tabs)/stack/[id]", params: { id: protocol.id } })
      }
      style={({ pressed }) => [
        styles.protocolRow,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.protocolLeft}>
        <View style={styles.protocolTopRow}>
          <Text style={styles.protocolName}>{protocol.name}</Text>
          {hasReadout && (
            <View style={styles.readoutBadge}>
              <Text style={styles.readoutText}>Readout ready</Text>
            </View>
          )}
        </View>
        <Text style={styles.protocolMeta}>
          Started {protocol.startDate}
          {protocol.outcome ? ` · ${protocol.outcome}` : ""}
        </Text>
        {protocol.adherence !== undefined && (
          <View style={styles.adherenceRow}>
            <View style={styles.adherenceBar}>
              <View
                style={[
                  styles.adherenceFill,
                  { width: `${protocol.adherence}%` as any },
                ]}
              />
            </View>
            <Text style={styles.adherenceText}>{protocol.adherence}% adherence</Text>
          </View>
        )}
      </View>
      <View style={styles.protocolRight}>
        <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
        <GradeChip grade={protocol.evidence} size="sm" />
        <Text style={styles.arrow}>→</Text>
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
  scroll: { flex: 1 },
  section: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 4 },
  protocolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
    gap: 12,
  },
  protocolLeft: { flex: 1, gap: 4 },
  protocolTopRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  protocolName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#000000",
  },
  readoutBadge: {
    backgroundColor: "#c5b0f4",
    borderRadius: 50,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  readoutText: { fontFamily: "Inter_600SemiBold", fontSize: 9, color: "#000000" },
  protocolMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
  },
  adherenceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  adherenceBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#efefea",
    borderRadius: 2,
    maxWidth: 100,
  },
  adherenceFill: {
    height: 3,
    backgroundColor: "#000000",
    borderRadius: 2,
  },
  adherenceText: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
  },
  protocolRight: { alignItems: "flex-end", gap: 6, paddingTop: 2 },
  statusChip: {
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#000000" },
  arrow: { opacity: 0.35, fontSize: 12 },
  emptyState: {
    padding: 32,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, textAlign: "center" },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.72,
    textAlign: "center",
  },
});
