import { Stack } from "expo-router";

export default function AskLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="answer" />
      <Stack.Screen name="add-to-stack" />
    </Stack>
  );
}
