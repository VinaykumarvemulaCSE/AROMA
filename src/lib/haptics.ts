// Mobile Haptic Feedback helper utilizing the HTML5 Vibration API

export type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "selection";

export function haptic(type: HapticType = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (type) {
      case "light":
      case "selection":
        navigator.vibrate(8);
        break;
      case "medium":
        navigator.vibrate(15);
        break;
      case "heavy":
        navigator.vibrate(25);
        break;
      case "success":
        navigator.vibrate([10, 30, 15]);
        break;
      case "warning":
        navigator.vibrate([20, 40, 20]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch {
    // Ignore devices that block programmatic vibrations
  }
}
