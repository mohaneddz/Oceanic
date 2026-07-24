import { invoke } from "@tauri-apps/api/core";
import { load, type Store } from "@tauri-apps/plugin-store";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  OceanicSettings,
  RustSettings,
  SavedScene,
  TimerPreset,
  TimerSessionState,
} from "../lib/types";
import { ALL_SOUNDS } from "../lib/sounds";
import {
  createDefaultScenes,
  createDefaultSettings,
  createDefaultTimerPresets,
  createDefaultTimerSession,
  sanitizeScenes,
  sanitizeSettings,
  sanitizeTimerPresets,
  sanitizeTimerSession,
} from "../lib/oceanicState";

const STORE_FILE = "oceanic-data.json";
const SETTINGS_KEY = "ui.settings";
const SCENES_KEY = "ui.scenes";
const TIMER_PRESETS_KEY = "ui.timer.presets";
const TIMER_SESSION_KEY = "ui.timer.session";

export function useOceanicPreferences() {
  const [settings, setSettings] = useState<OceanicSettings>(() => createDefaultSettings());
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>(() => createDefaultScenes());
  const [timerPresets, setTimerPresets] = useState<TimerPreset[]>(() =>
    createDefaultTimerPresets(createDefaultScenes()),
  );
  const [timerSession, setTimerSession] = useState<TimerSessionState>(() =>
    createDefaultTimerSession(createDefaultTimerPresets(createDefaultScenes())),
  );
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const hasTauriRuntime =
        typeof window !== "undefined" &&
        Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

      if (!hasTauriRuntime) {
        if (!cancelled) {
          setReady(true);
        }
        return;
      }

      try {
        const storeInstance = await load(STORE_FILE, { defaults: {}, autoSave: 200 });
        const [savedSettings, savedScenesValue, savedTimerPresets, savedTimerSession, rustSettings] =
          await Promise.all([
            storeInstance.get<unknown>(SETTINGS_KEY),
            storeInstance.get<unknown>(SCENES_KEY),
            storeInstance.get<unknown>(TIMER_PRESETS_KEY),
            storeInstance.get<unknown>(TIMER_SESSION_KEY),
            invoke<RustSettings>("get_settings").catch(() => null),
          ]);

        if (cancelled) {
          void storeInstance.close();
          return;
        }

        const sanitizedSettings = sanitizeSettings(savedSettings);
        const hydratedScenes = sanitizeScenes(savedScenesValue);
        const hydratedTimerPresets = sanitizeTimerPresets(savedTimerPresets, hydratedScenes);
        const hydratedTimerSession = sanitizeTimerSession(savedTimerSession, hydratedTimerPresets);

        const mergedSettings: OceanicSettings = rustSettings
          ? {
              ...sanitizedSettings,
              minimizeToTray: rustSettings.minimizeToTray,
              startMinimized: rustSettings.startMinimized,
              fadeOutOnClose: rustSettings.fadeOutOnClose,
              fadeOutDuration: rustSettings.fadeOutDuration,
            }
          : sanitizedSettings;

        storeRef.current = storeInstance;
        setStore(storeInstance);
        setSettings(mergedSettings);
        setSavedScenes(hydratedScenes);
        setTimerPresets(hydratedTimerPresets);
        setTimerSession(hydratedTimerSession);
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

    // Debounced: without this, every slider drag tick or keystroke would trigger
    // 4 store writes + a Rust IPC round-trip immediately, causing jank while
    // dragging. The store's own autoSave (see `load` below) already debounces the
    // actual disk flush, so this just keeps IPC traffic from firing on every tick.
    const timeout = window.setTimeout(() => {
      void Promise.all([
        store.set(SETTINGS_KEY, settings),
        store.set(SCENES_KEY, savedScenes),
        store.set(TIMER_PRESETS_KEY, timerPresets),
        store.set(TIMER_SESSION_KEY, timerSession),
      ]).catch(() => {});

      void invoke("save_settings", {
        settings: {
          minimizeToTray: settings.minimizeToTray,
          startMinimized: settings.startMinimized,
          fadeOutOnClose: settings.fadeOutOnClose,
          fadeOutDuration: settings.fadeOutDuration,
        },
      }).catch(() => {});
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [ready, savedScenes, settings, store, timerPresets, timerSession]);

  const activeCount = useMemo(
    () => ALL_SOUNDS.filter((sound) => settings.enabled[sound.id]).length,
    [settings.enabled],
  );

  return {
    settings,
    setSettings,
    savedScenes,
    setSavedScenes,
    timerPresets,
    setTimerPresets,
    timerSession,
    setTimerSession,
    activeCount,
    ready,
  };
}
