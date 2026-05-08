import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Index() {
  useEffect(() => {
    async function check() {
      try {
        const onboarded = await AsyncStorage.getItem("onboarded");
        if (onboarded) {
          router.replace("/(tabs)/ask");
        } else {
          router.replace("/onboarding");
        }
      } catch {
        router.replace("/onboarding");
      }
    }
    check();
  }, []);

  return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />;
}
