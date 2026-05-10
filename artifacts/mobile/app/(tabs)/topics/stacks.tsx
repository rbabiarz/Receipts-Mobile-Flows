import { router } from "expo-router";
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

import { GradeChip } from "@/components/GradeChip";
import { HeroBlock } from "@/components/HeroBlock";
import { MonoLabel } from "@/components/MonoLabel";
import { PillButton } from "@/components/PillButton";
import { getScreenTopPadding } from "@/constants/screenInsets";
import { useApp } from "@/context/AppContext";
import type { PublishedStack } from "@/types";

export default function PublishedStacks() {
  const insets = useSafeAreaInsets();
  const { publishedStacks } = useApp();
  const [selected, setSelected] = useState<PublishedStack | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubscribed(true);
    setConfirming(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (selected && confirming) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
          <Pressable onPress={() => setConfirming(false)}>
            <Text style={styles.backBtn}>← {selected.title}</Text>
          </Pressable>
          <MonoLabel>Subscribe</MonoLabel>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <HeroBlock color="lime" style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 8 }}>
            <MonoLabel size={9}>{selected.author}</MonoLabel>
            <Text style={styles.stackTitle}>{selected.title}</Text>
            <Text style={styles.priceText}>
              {selected.isFree
                ? "Free"
                : `$${selected.pricePerMonth}/mo`}
            </Text>
          </HeroBlock>
          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 8 }}>What's included</MonoLabel>
            {selected.groups.map((g, i) => (
              <View key={i} style={styles.groupRow}>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupItems}>{g.items}</Text>
              </View>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.confirmDisc}>
              You can cancel any time. Your data is not shared with the Stack author.
            </Text>
          </View>
        </ScrollView>
        <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 12 }]}>
          <PillButton label="Cancel" variant="light" onPress={() => setConfirming(false)} flex />
          <PillButton
            label={selected.isFree ? "Subscribe free →" : `Subscribe · $${selected.pricePerMonth}/mo →`}
            onPress={handleSubscribe}
            loading={loading}
            flex
          />
        </View>
      </View>
    );
  }

  if (selected) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
          <Pressable onPress={() => { setSelected(null); setSubscribed(false); }}>
            <Text style={styles.backBtn}>← Stacks</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <HeroBlock color="lime" style={{ paddingHorizontal: 18, paddingVertical: 18, gap: 8 }}>
            <MonoLabel size={9}>{selected.credential}</MonoLabel>
            <Text style={styles.stackTitle}>{selected.title}</Text>
            <Text style={styles.stackAuthor}>by {selected.author}</Text>
            <View style={styles.stackMeta}>
              <GradeChip grade={selected.gradeCore} label="Evidence core" size="sm" />
              <Text style={styles.stackSubs}>{selected.subscribers} subscribers</Text>
              {selected.noSponsorship && (
                <View style={styles.noSponsBadge}>
                  <Text style={styles.noSponsText}>No sponsorships</Text>
                </View>
              )}
            </View>
          </HeroBlock>

          <View style={styles.section}>
            <MonoLabel style={{ marginBottom: 8 }}>About</MonoLabel>
            <Text style={styles.descText}>{selected.description}</Text>
          </View>

          {selected.groups.length > 0 && (
            <View style={styles.section}>
              <MonoLabel style={{ marginBottom: 8 }}>
                Contents ({selected.protocolCount} protocols)
              </MonoLabel>
              {selected.groups.map((g, i) => (
                <View key={i} style={styles.groupRow}>
                  <View style={styles.groupLeft}>
                    <Text style={styles.groupName}>{g.name}</Text>
                    <Text style={styles.groupItems}>{g.items}</Text>
                  </View>
                  <View style={styles.groupCount}>
                    <Text style={styles.groupCountText}>{g.count}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {subscribed && (
            <View style={styles.subscribedBanner}>
              <Text style={styles.subscribedText}>Subscribed! Protocols added to your Stack.</Text>
            </View>
          )}
        </ScrollView>
        {!subscribed && (
          <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === "web" ? 34 : 0) + 12 }]}>
            {selected.hasTrial && (
              <Text style={styles.trialText}>
                {selected.trialDays}-day free trial
              </Text>
            )}
            <PillButton
              label={
                selected.isFree
                  ? "Subscribe free →"
                  : selected.hasTrial
                  ? `Try free for ${selected.trialDays} days →`
                  : `Subscribe · $${selected.pricePerMonth}/mo →`
              }
              onPress={() => setConfirming(true)}
              flex
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: getScreenTopPadding(insets.top) }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Topics</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Published Stacks</Text>
      </View>

      <View style={styles.explainer}>
        <Text style={styles.explainerText}>
          Clinicians and researchers publishing evidence-graded protocol stacks. We verify no sponsorship conflicts.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 + (Platform.OS === "web" ? 34 : 0) }}>
        {publishedStacks.map((s) => (
          <Pressable
            key={s.id}
            style={styles.stackRow}
            onPress={() => setSelected(s)}
          >
            <View style={styles.stackRowLeft}>
              <View style={styles.stackAvatar}>
                <Text style={styles.stackAvatarText}>
                  {s.author.split(" ").pop()?.slice(0, 2).toUpperCase() ?? "DR"}
                </Text>
              </View>
              <View style={styles.stackInfo}>
                <Text style={styles.stackRowTitle}>{s.title}</Text>
                <Text style={styles.stackRowAuthor}>{s.credential}</Text>
                <Text style={styles.stackRowMeta}>
                  {s.subscribers} subscribers ·{" "}
                  {s.isFree ? "Free" : `$${s.pricePerMonth}/mo`}
                </Text>
              </View>
            </View>
            <View style={styles.stackRowRight}>
              <GradeChip grade={s.gradeCore} size="sm" />
              <Text style={styles.rowArrow}>→</Text>
            </View>
          </Pressable>
        ))}
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
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  backBtn: { fontFamily: "Inter_400Regular", fontSize: 14, opacity: 0.6 },
  explainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#f7f7f5",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  explainerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.78,
  },
  stackRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  stackRowLeft: { flexDirection: "row", gap: 12, flex: 1 },
  stackAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stackAvatarText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#ffffff" },
  stackInfo: { flex: 1 },
  stackRowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 19 },
  stackRowAuthor: { fontFamily: "Inter_400Regular", fontSize: 11, opacity: 0.72, marginTop: 1 },
  stackRowMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    opacity: 0.62,
    marginTop: 3,
  },
  stackRowRight: { alignItems: "flex-end", gap: 6 },
  rowArrow: { opacity: 0.35 },
  stackTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  stackAuthor: { fontFamily: "Inter_400Regular", fontSize: 13, opacity: 0.78 },
  priceText: { fontFamily: "Inter_600SemiBold", fontSize: 20 },
  stackMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  stackSubs: { fontFamily: "Inter_400Regular", fontSize: 11, opacity: 0.72 },
  noSponsBadge: {
    backgroundColor: "#c8e6cd",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  noSponsText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e6e6",
  },
  descText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  groupRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f1f1",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  groupLeft: { flex: 1 },
  groupName: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 18 },
  groupItems: { fontFamily: "Inter_400Regular", fontSize: 11, opacity: 0.7, lineHeight: 16, marginTop: 2 },
  groupCount: {
    backgroundColor: "#f7f7f5",
    borderRadius: 50,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  groupCountText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  subscribedBanner: {
    margin: 18,
    backgroundColor: "#c8e6cd",
    borderRadius: 10,
    padding: 14,
  },
  subscribedText: { fontFamily: "Inter_500Medium", fontSize: 13, textAlign: "center" },
  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e6e6e6",
    gap: 8,
  },
  trialText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    opacity: 0.62,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  confirmDisc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.72,
    textAlign: "center",
  },
});
