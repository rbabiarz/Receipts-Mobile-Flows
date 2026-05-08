import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
import { MonoLabel } from "@/components/MonoLabel";
import { useApp } from "@/context/AppContext";
import type { Protocol } from "@/types";

export default function AddToStack() {
  const { from } = useLocalSearchParams<{ from: string }>();
  const insets = useSafeAreaInsets();
  const { addProtocol } = useApp();

  const [name, setName] = useState("Taurine 2 g/day");
  const [dose, setDose] = useState("2 g");
  const [timing, setTiming] = useState("AM, w/ food");
  const [duration, setDuration] = useState("12 weeks");
  const [outcome, setOutcome] = useState("SBP + ApoB");
  const [hypothesis, setHypothesis] = useState(
    "Reduce BP and improve lipid profile based on RCT evidence"
  );
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const protocol: Protocol = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      name,
      status: "trial",
      startDate: new Date().toISOString().split("T")[0],
      evidence: "B",
      dose,
      timing,
      duration,
      washout: "4 weeks",
      outcome,
      outcomeMarker: outcome,
      hypothesis,
      weeks: duration,
      source: "Receipts · Auto-added",
      adherence: 100,
      timeline: [
        {
          title: `Started ${name}`,
          detail: `${dose}, ${timing}`,
          date: "Today",
        },
      ],
    };
    await addProtocol(protocol);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)/stack");
  }

  function FieldRow({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) {
    return (
      <View style={styles.fieldRow}>
        <MonoLabel size={9} style={{ width: 70 }}>
          {label}
        </MonoLabel>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.35)"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
          },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Answer</Text>
        </Pressable>
        <MonoLabel>Add to Stack</MonoLabel>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sourceRow}>
          <MonoLabel size={9}>From</MonoLabel>
          <Text style={styles.sourceText} numberOfLines={2}>
            {from || "Your Receipts research"}
          </Text>
        </View>

        <View style={styles.card}>
          <MonoLabel style={{ marginBottom: 10 }}>Protocol details</MonoLabel>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Protocol name"
            placeholderTextColor="rgba(0,0,0,0.35)"
          />
        </View>

        <View style={styles.card}>
          <MonoLabel style={{ marginBottom: 10 }}>Dosing</MonoLabel>
          <FieldRow label="Dose" value={dose} onChange={setDose} placeholder="e.g. 5 g" />
          <FieldRow label="Timing" value={timing} onChange={setTiming} placeholder="e.g. AM, w/ food" />
          <FieldRow label="Duration" value={duration} onChange={setDuration} placeholder="e.g. 12 weeks" />
        </View>

        <View style={styles.card}>
          <MonoLabel style={{ marginBottom: 10 }}>Tracking</MonoLabel>
          <FieldRow
            label="Outcome"
            value={outcome}
            onChange={setOutcome}
            placeholder="e.g. SBP + ApoB"
          />
          <FieldRow
            label="Hypothesis"
            value={hypothesis}
            onChange={setHypothesis}
            placeholder="What do you expect?"
          />
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Receipts will remind you</Text>
          {[
            "When to test (before + after)",
            "Evidence contradictions that emerge while you're running this",
            "Similar n=1 readouts from the community",
          ].map((item, i) => (
            <View key={i} style={styles.guideRow}>
              <Text style={styles.guideBullet}>●</Text>
              <Text style={styles.guideText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 12 },
        ]}
      >
        <PillButton
          label="Cancel"
          variant="light"
          onPress={() => router.back()}
          flex
        />
        <PillButton
          label="Add to Stack"
          onPress={handleAdd}
          loading={loading}
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
  scroll: { flex: 1 },
  sourceRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#f7f7f5",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  sourceText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  nameInput: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    letterSpacing: -0.26,
    color: "#000000",
    paddingVertical: 4,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f1",
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#000000",
  },
  guideCard: {
    marginHorizontal: 18,
    marginVertical: 14,
    backgroundColor: "#c8e6cd",
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  guideTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginBottom: 4,
  },
  guideRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  guideBullet: { opacity: 0.55, fontSize: 8, paddingTop: 4 },
  guideText: { fontFamily: "Inter_400Regular", fontSize: 12, flex: 1, lineHeight: 18 },
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
