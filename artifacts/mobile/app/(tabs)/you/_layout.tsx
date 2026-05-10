import { Stack } from "expo-router";

export default function YouLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="saved-answers" />
    </Stack>
  );
}
