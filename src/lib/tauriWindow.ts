import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * The current Tauri window, or null when running outside the desktop shell
 * (e.g. `pnpm dev` in a plain browser). Callers can then no-op instead of
 * throwing on every window call.
 */
export function getAppWindow() {
  try {
    return getCurrentWindow();
  } catch {
    return null;
  }
}
