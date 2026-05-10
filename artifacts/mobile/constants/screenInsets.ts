import { Platform } from "react-native";

/** Minimum top padding for notch / status bar on native (points). */
export const NOTCH_TOP_MIN = 44;

/** Extra top offset on web (browser chrome / tab strip). */
export const WEB_TOP_EXTRA = 67;

/**
 * Top padding for screen headers and full-screen layouts.
 * Native: at least {@link NOTCH_TOP_MIN} below the physical top, or the safe-area inset if larger.
 * Web: safe inset plus {@link WEB_TOP_EXTRA} (unchanged from prior layout).
 */
export function getScreenTopPadding(insetsTop: number): number {
  if (Platform.OS === "web") {
    return insetsTop + WEB_TOP_EXTRA;
  }
  return Math.max(insetsTop, NOTCH_TOP_MIN);
}
