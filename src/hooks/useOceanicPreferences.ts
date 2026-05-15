import { invoke } from "@tauri-apps/api/core";
import { load, type Store } from "@tauri-apps/plugin-store";
import { useEffect, useMemo, useRef, useState } from "react";
import type { OceanicSettings, RustSettings } from "../lib/types";
import { ALL_SOUNDS } from "../lib/sounds";

const STORE_FILE = "oceanic-data.json";
const SETTINGS_KEY = "ui.settings";

function defaults(): OceanicSettings {
  const perSoundVolume: Record<string, number> = {};
  const enabled: Record<string, boolean> = {};
  const favorite: Record<string, boolean> = {};
  for (const sound of ALL_SOUNDS) {
    perSoundVolume[sound.id] = 0.6;
    enabled[sound.id] = false;
    favorite[sound.id] = false;
  }
  favorite.rain = true;
  favorite.waves = true;
  favorite.stream = true;
  favorite["white-noise"] = true;
  enabled.rain = true;
  enabled.waves = true;

  return {
    minimizeToTray: true,
    startMinimized: false,
    masterVolume: 0.7,
    perSoundVolume,
    enabled,
    favorite,
    sleepTimerMinutes: null,
    fadeOutMinutes: 30,
    theme: "oceanic",
    hideInactiveSounds: false,
    autoPlayOnLaunch: true,
    audioDucking: true,
    fadeOutOnClose: true,
    fadeOutDuration: 3,
    globalMediaHotkeys: false,
    reduceMotion: false,
    largerUI: false,
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
    favorite: { ...fallback.favorite, ...(parsed.favorite ?? {}) },
    sleepTimerMinutes:
      typeof parsed.sleepTimerMinutes === "number" || parsed.sleepTimerMinutes === null
        ? parsed.sleepTimerMinutes
        : fallback.sleepTimerMinutes,
    fadeOutMinutes:
      typeof parsed.fadeOutMinutes === "number" || parsed.fadeOutMinutes === null
        ? parsed.fadeOutMinutes
        : fallback.fadeOutMinutes,
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
    audioDucking:
      typeof parsed.audioDucking === "boolean"
        ? parsed.audioDucking
        : fallback.audioDucking,
    fadeOutOnClose:
      typeof parsed.fadeOutOnClose === "boolean"
        ? parsed.fadeOutOnClose
        : fallback.fadeOutOnClose,
    fadeOutDuration:
      typeof parsed.fadeOutDuration === "number"
        ? parsed.fadeOutDuration
        : fallback.fadeOutDuration,
    globalMediaHotkeys:
      typeof parsed.globalMediaHotkeys === "boolean"
        ? parsed.globalMediaHotkeys
        : fallback.globalMediaHotkeys,
    reduceMotion:
      typeof parsed.reduceMotion === "boolean"
        ? parsed.reduceMotion
        : fallback.reduceMotion,
    largerUI:
      typeof parsed.largerUI === "boolean"
        ? parsed.largerUI
        : fallback.largerUI,
  };
}

export function useOceanicPreferences() {
  const [settings, setSettings] = useState<OceanicSettings>(() => defaults());
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const storeRef = useRef<Store | null>(null);

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

        storeRef.current = storeInstance;
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
      const currentStore = storeRef.current;
      storeRef.current = null;
      if (currentStore) {
        void currentStore.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !store) {
      return;
    }

    void store.set(SETTINGS_KEY, settings)
      .then(() => store.save())
      .catch(() => {});
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
