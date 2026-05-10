import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet } from "react-native";

/**
 * expo-router `NativeTabs` (liquid glass) has regressed navigation with nested
 * stack screens on some iOS builds. Keep classic tabs until native tabs are stable.
 */
const USE_LIQUID_GLASS_NATIVE_TABS = false;

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="ask">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <Label>Ask</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="verify">
        <Icon sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }} />
        <Label>Verify</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="topics">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Topics</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stack">
        <Icon sf={{ default: "square.stack.3d.up", selected: "square.stack.3d.up.fill" }} />
        <Label>Stack</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="you">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>You</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarStyle: {
          backgroundColor: isIOS ? "transparent" : "#000000",
          borderTopWidth: 0,
          elevation: 0,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 0.2,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: "Ask",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="magnifyingglass" tintColor={color} size={22} />
            ) : (
              <Feather name="search" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="verify"
        options={{
          title: "Verify",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="checkmark.circle" tintColor={color} size={22} />
            ) : (
              <Feather name="check-circle" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="topics"
        options={{
          title: "Topics",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="book" tintColor={color} size={22} />
            ) : (
              <Feather name="book-open" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="stack"
        options={{
          title: "Stack",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="square.stack.3d.up" tintColor={color} size={22} />
            ) : (
              <Feather name="layers" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: "You",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={20} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (
    USE_LIQUID_GLASS_NATIVE_TABS &&
    Platform.OS === "ios" &&
    isLiquidGlassAvailable()
  ) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
