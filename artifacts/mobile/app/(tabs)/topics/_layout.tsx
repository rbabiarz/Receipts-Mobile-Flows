import { Stack } from "expo-router";

export default function TopicsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="influencers" />
      <Stack.Screen name="stacks" />
    </Stack>
  );
}
