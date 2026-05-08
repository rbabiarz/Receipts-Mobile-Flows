import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PillButton } from "@/components/PillButton";

export default function Safety() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.coral}>
        <Text style={styles.eyebrow}>Triage layer · acute-symptom pattern matched</Text>
        <Text style={styles.heading}>
          This sounds like something for a clinician now.
        </Text>
        <Text style={styles.body}>
          Chest pain on exertion is the kind of symptom that doctors want to evaluate quickly. We're going to step out of literature mode for this one.
        </Text>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetLabel}>If this is happening right now</Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.actionDark}
            onPress={() => Linking.openURL("tel:911")}
          >
            <Text style={styles.actionDarkText}>Call 911</Text>
            <Text style={styles.actionMeta}>Emergency</Text>
          </Pressable>
          <Pressable style={styles.actionLight}>
            <Text style={styles.actionLightText}>Telehealth — same-day visit</Text>
            <Text style={styles.actionMeta}>Sesame · Amwell</Text>
          </Pressable>
          <Pressable style={styles.actionLight}>
            <Text style={styles.actionLightText}>Find a cardiologist near you</Text>
            <Text style={styles.actionMeta}>NPI directory</Text>
          </Pressable>
        </View>

        <Text style={[styles.sheetLabel, { marginTop: 20 }]}>
          If it's already passed
        </Text>
        <Text style={styles.passedText}>
          Still worth a cardiology visit. We'll be here for the literature after you've seen a doctor.
        </Text>

        <PillButton
          label="Go back to Receipts"
          variant="light"
          onPress={() => router.back()}
          style={{ marginTop: 20, borderColor: "#e6e6e6" }}
        />

        <Text style={styles.disc}>
          Receipts does not provide medical advice. Always consult a qualified healthcare provider for symptoms.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3c9b6" },
  coral: {
    backgroundColor: "#f3c9b6",
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 24,
  },
  eyebrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.72,
    marginBottom: 8,
  },
  heading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 26,
    letterSpacing: -0.26,
    lineHeight: 32,
    marginBottom: 12,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.85,
  },
  sheet: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
    paddingBottom: Platform.OS === "web" ? 34 : 20,
  },
  sheetLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    opacity: 0.62,
    marginBottom: 10,
  },
  actions: { gap: 8 },
  actionDark: {
    backgroundColor: "#000000",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionDarkText: {
    color: "#ffffff",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  actionLight: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionLightText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#000000",
  },
  actionMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    opacity: 0.6,
    letterSpacing: 0.4,
  },
  passedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.78,
  },
  disc: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    opacity: 0.55,
    lineHeight: 16,
    marginTop: 16,
    textAlign: "center",
  },
});
