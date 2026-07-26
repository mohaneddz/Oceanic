import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

let permissionState: "unknown" | "granted" | "denied" = "unknown";

/**
 * Fire a desktop notification. Silently does nothing outside the Tauri shell or
 * when the user has denied the permission - a missed reminder should never
 * surface an error to the user.
 */
export async function notify(title: string, body: string) {
  try {
    if (permissionState === "denied") {
      return;
    }

    if (permissionState === "unknown") {
      permissionState = (await isPermissionGranted())
        ? "granted"
        : (await requestPermission()) === "granted"
          ? "granted"
          : "denied";
    }

    if (permissionState !== "granted") {
      return;
    }

    sendNotification({ title, body });
  } catch {
    // No Tauri runtime (browser preview) or the plugin is unavailable.
    permissionState = "denied";
  }
}
