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

import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { TextField } from "@/components/TextField";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";
import type { Protocol } from "@/types";

interface ProtocolDefaults {
  name: string;
  dose: string;
  timing: string;
  duration: string;
  outcome: string;
  hypothesis: string;
  evidence: "A" | "B" | "C" | "D";
}

function deriveProtocol(query: string): ProtocolDefaults {
  const q = query.toLowerCase();

  if (q.includes("omega") || q.includes("fish oil") || q.includes("epa") || q.includes("dha")) {
    return {
      name: "Omega-3 EPA 2 g/day",
      dose: "2 g EPA",
      timing: "With largest meal",
      duration: "12 weeks",
      outcome: "Triglycerides + LDL-C",
      hypothesis: "Reduce triglycerides via high-dose EPA supplementation",
      evidence: "B",
    };
  }
  if (q.includes("nmn") || q.includes("nad") || q.includes("nicotinamide")) {
    return {
      name: "NMN 500 mg/day",
      dose: "500 mg",
      timing: "AM, fasted",
      duration: "12 weeks",
      outcome: "NAD+ levels + biological age markers",
      hypothesis: "Raise NAD+ and evaluate downstream metabolic markers",
      evidence: "C",
    };
  }
  if (q.includes("berberine") || q.includes("metformin")) {
    return {
      name: "Berberine 500 mg ×3",
      dose: "500 mg",
      timing: "×3 with meals",
      duration: "12 weeks",
      outcome: "Fasting glucose + HbA1c",
      hypothesis: "Improve glycemic control via AMPK activation",
      evidence: "B",
    };
  }
  if (q.includes("magnesium") || q.includes("glycinate") || q.includes("threonate")) {
    return {
      name: "Magnesium Glycinate 400 mg",
      dose: "400 mg",
      timing: "PM, 1h before sleep",
      duration: "8 weeks",
      outcome: "Sleep onset latency + HRV",
      hypothesis: "Improve sleep quality by restoring magnesium status",
      evidence: "A",
    };
  }
  if (q.includes("zone 2") || q.includes("zone2") || q.includes("hiit") || q.includes("vo2") || q.includes("vo₂")) {
    return {
      name: "Zone 2, 150 min/wk",
      dose: "150 min/week",
      timing: "3–4 sessions, split evenly",
      duration: "12 weeks",
      outcome: "VO₂max + fasting glucose",
      hypothesis: "Build aerobic base and improve metabolic markers",
      evidence: "A",
    };
  }
  if (q.includes("creatine")) {
    return {
      name: "Creatine Monohydrate 5 g/day",
      dose: "5 g",
      timing: "Post-workout or AM",
      duration: "Ongoing",
      outcome: "Working memory + grip strength",
      hypothesis: "Improve cognition and strength via creatine saturation",
      evidence: "A",
    };
  }
  if (q.includes("cold") || q.includes("ice bath") || q.includes("cold plunge")) {
    return {
      name: "Cold Plunge 3×/wk",
      dose: "3× per week, 2–3 min at 10–15°C",
      timing: "Not within 4h of strength training",
      duration: "8 weeks",
      outcome: "Recovery score + mood (subjective)",
      hypothesis: "Improve recovery and mood via norepinephrine response",
      evidence: "C",
    };
  }
  if (q.includes("taurine")) {
    return {
      name: "Taurine 2 g/day",
      dose: "2 g",
      timing: "AM, w/ food",
      duration: "12 weeks",
      outcome: "SBP + ApoB",
      hypothesis: "Reduce BP and improve lipid profile based on RCT evidence",
      evidence: "B",
    };
  }
  // Generic fallback — use the query text as the protocol name
  const capitalized = query.trim().slice(0, 1).toUpperCase() + query.trim().slice(1);
  return {
    name: capitalized.slice(0, 50),
    dose: "Per evidence-supported dose",
    timing: "Per study protocol",
    duration: "8–12 weeks",
    outcome: "Track relevant biomarkers before + after",
    hypothesis: `Evaluate ${query.trim()} based on current evidence`,
    evidence: "C",
  };
}

export default function AddToStack() {
  const { from } = useLocalSearchParams<{ from: string }>();
  const insets = useSafeAreaInsets();
  const { addProtocol } = useApp();

  const defaults = deriveProtocol(from ?? "");

  const [name, setName] = useState(defaults.name);
  const [dose, setDose] = useState(defaults.dose);
  const [timing, setTiming] = useState(defaults.timing);
  const [duration, setDuration] = useState(defaults.duration);
  const [outcome, setOutcome] = useState(defaults.outcome);
  const [hypothesis, setHypothesis] = useState(defaults.hypothesis);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const protocol: Protocol = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      name,
      status: "trial",
      startDate: new Date().toISOString().split("T")[0],
      evidence: defaults.evidence,
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
        <TextField
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
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
            paddingTop: getScreenTopPadding(insets.top),
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
          <TextField
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Protocol name"
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
    marginTop: 4,
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
    minWidth: 0,
    fontSize: 14,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 4,
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
