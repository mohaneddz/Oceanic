import { invoke } from "@tauri-apps/api/core";
import { load, type Store } from "@tauri-apps/plugin-store";
import { useEffect, useMemo, useState } from "react";
import type { OceanicSettings, RustSettings } from "../lib/types";
import { ALL_SOUNDS } from "../lib/sounds";

const STORE_FILE = "oceanic-data.json";
const SETTINGS_KEY = "ui.settings";

function defaults(): OceanicSettings {
  const perSoundVolume: Record<string, number> = {};
  const enabled: Record<string, boolean> = {};
  for (const sound of ALL_SOUNDS) {
    perSoundVolume[sound.id] = 0.6;
    enabled[sound.id] = false;
  }
  enabled.rain = true;
  enabled.waves = true;

  return {
    minimizeToTray: true,
    startMinimized: false,
    masterVolume: 0.7,
    perSoundVolume,
    enabled,
    theme: "oceanic",
    hideInactiveSounds: false,
    autoPlayOnLaunch: true,
  };
}

function sanitize(input: unknown): OceanicSettings {
  const fallback = defaults();
  if (!input || typeof input !== "object") {
    return fallback;
  }
  const parsed = input as Partial<OceanicSettings>;

  return {
    minimizeToTray:
      typeof parsed.minimizeToTray === "boolean" ? parsed.minimizeToTray : fallback.minimizeToTray,
    startMinimized:
      typeof parsed.startMinimized === "boolean" ? parsed.startMinimized : fallback.startMinimized,
    masterVolume:
      typeof parsed.masterVolume === "number" ? parsed.masterVolume : fallback.masterVolume,
    perSoundVolume: { ...fallback.perSoundVolume, ...(parsed.perSoundVolume ?? {}) },
    enabled: { ...fallback.enabled, ...(parsed.enabled ?? {}) },
    theme:
      parsed.theme === "light" ||
      parsed.theme === "dark" ||
      parsed.theme === "cherry" ||
      parsed.theme === "acacia" ||
      parsed.theme === "oceanic"
        ? parsed.theme
        : fallback.theme,
    hideInactiveSounds:
      typeof parsed.hideInactiveSounds === "boolean"
        ? parsed.hideInactiveSounds
        : fallback.hideInactiveSounds,
    autoPlayOnLaunch:
      typeof parsed.autoPlayOnLaunch === "boolean"
        ? parsed.autoPlayOnLaunch
        : fallback.autoPlayOnLaunch,
  };
}

export function useOceanicPreferences() {
  const [settings, setSettings] = useState<OceanicSettings>(() => defaults());
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const storeInstance = await load(STORE_FILE, { defaults: {}, autoSave: 200 });
        const saved = await storeInstance.get<unknown>(SETTINGS_KEY);
        const rustSettings = await invoke<RustSettings>("get_settings").catch(() => null);
        if (cancelled) {
          void storeInstance.close();
          return;
        }

        const sanitized = sanitize(saved);
        const merged: OceanicSettings = rustSettings
          ? {
              ...sanitized,
              minimizeToTray: rustSettings.minimizeToTray,
              startMinimized: rustSettings.startMinimized,
            }
          : sanitized;

        setStore(storeInstance);
        setSettings(merged);
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
      if (store) {
        void store.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !store) {
      return;
    }

    void store.set(SETTINGS_KEY, settings);
    void invoke("save_settings", {
      settings: {
        minimizeToTray: settings.minimizeToTray,
        startMinimized: settings.startMinimized,
      },
    }).catch(() => {
      // Ignore outside tauri.
    });
  }, [ready, settings, store]);

  const activeCount = useMemo(
    () => ALL_SOUNDS.filter((sound) => settings.enabled[sound.id]).length,
    [settings.enabled]
  );

  return { settings, setSettings, activeCount, ready };
}
