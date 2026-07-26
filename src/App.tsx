import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Titlebar from "./components/Titlebar";
import { useOceanicPreferences } from "./hooks/useOceanicPreferences";
import { ALL_SOUNDS } from "./lib/sounds";
import type { SavedScene, TimerPhase, TimerPreset } from "./lib/types";
import { MixerPage } from "./pages/MixerPage";
import { ScenesPage } from "./pages/ScenesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TimerPage } from "./pages/TimerPage";
import { ScenePlayer } from "./components/ScenePlayer";
import { CreateSceneModal } from "./components/CreateSceneModal";
import { warmSceneVideoCache } from "./lib/videoCache";
import { getTimerPresetCycle } from "./lib/oceanicState";
import { TimerPresetsPage } from "./pages/TimerPresetsPage";
import { CreatePresetModal } from "./components/CreatePresetModal";
import { createId } from "./lib/ids";

const DUCK_GAIN = 0.3;

function App() {
  const {
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
  } = useOceanicPreferences();
  const [isPlaying, setIsPlaying] = useState(true);
  const [startWithWindows, setStartWithWindows] = useState(false);
  const [playingScene, setPlayingScene] = useState<SavedScene | null>(null);
  const [creatingScene, setCreatingScene] = useState(false);
  const [creatingPreset, setCreatingPreset] = useState(false);
  /** True while the fullscreen scene video is playing with its own audio unmuted. */
  const [sceneAudioActive, setSceneAudioActive] = useState(false);

  // Ambient beds drop to this fraction of their normal level while other audio
  // (currently: a scene video's own soundtrack) is playing over them.
  const duckGain = settings.audioDucking && sceneAudioActive ? DUCK_GAIN : 1;
  const duckGainRef = useRef(duckGain);

  useEffect(() => {
    duckGainRef.current = duckGain;
  }, [duckGain]);

  const audioRef = useRef<Record<string, HTMLAudioElement>>({});
  const fadeIntervalRef = useRef<number | null>(null);
  const sleepTimeoutRef = useRef<number | null>(null);
  const fadeStartTimeoutRef = useRef<number | null>(null);
  const fadeInProgressRef = useRef(false);
  const closeBypassRef = useRef(false);
  const settingsRef = useRef(settings);
  const navigate = useNavigate();

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const activeScene = useMemo(() => {
    const direct = savedScenes.find((scene) => scene.id === settings.selectedSceneId);
    if (direct) {
      return direct;
    }
    return savedScenes.find((scene) => scene.isDefault) ?? savedScenes[0] ?? null;
  }, [savedScenes, settings.selectedSceneId]);

  const activePreset = useMemo(
    () =>
      timerPresets.find((preset) => preset.id === timerSession.activePresetId) ??
      timerPresets[0] ??
      null,
    [timerPresets, timerSession.activePresetId],
  );

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current !== null) {
      window.clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    fadeInProgressRef.current = false;
  };

  const clearSleepTimeout = () => {
    if (sleepTimeoutRef.current !== null) {
      window.clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
  };

  const clearFadeStartTimeout = () => {
    if (fadeStartTimeoutRef.current !== null) {
      window.clearTimeout(fadeStartTimeoutRef.current);
      fadeStartTimeoutRef.current = null;
    }
  };

  const restoreAudioVolumes = () => {
    const live = settingsRef.current;
    for (const sound of ALL_SOUNDS) {
      const audio = audioRef.current[sound.id];
      if (audio) {
        const per = live.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6;
        audio.volume = Math.max(0, Math.min(1, live.masterVolume * per * duckGainRef.current));
      }
    }
  };

  const startFadeOutProcess = (durationMs: number, onComplete?: () => void) => {
    if (durationMs <= 0) {
      onComplete?.();
      return;
    }

    const live = settingsRef.current;
    const audible = ALL_SOUNDS.filter((sound) => live.enabled[sound.id]).map((sound) => ({
      audio: audioRef.current[sound.id],
      baseVolume: Math.max(
        0,
        Math.min(
          1,
          live.masterVolume *
            (live.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6) *
            duckGainRef.current,
        ),
      ),
    }));

    if (!audible.length) {
      onComplete?.();
      return;
    }

    clearFadeInterval();
    fadeInProgressRef.current = true;

    const stepMs = 200;
    const steps = Math.max(1, Math.ceil(durationMs / stepMs));
    let tick = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      tick += 1;
      const progress = Math.min(1, tick / steps);
      const gain = 1 - progress;

      for (const entry of audible) {
        if (entry.audio) {
          entry.audio.volume = entry.baseVolume * gain;
        }
      }

      if (progress >= 1) {
        clearFadeInterval();
        onComplete?.();
      }
    }, stepMs);
  };

  // Stable identities so the memoized mixer cards don't all re-render on every
  // slider tick.
  const handleMasterVolume = useCallback(
    (value: number) => setSettings((current) => ({ ...current, masterVolume: value })),
    [setSettings],
  );

  const handleToggleSound = useCallback(
    (soundId: string) =>
      setSettings((current) => ({
        ...current,
        enabled: { ...current.enabled, [soundId]: !current.enabled[soundId] },
      })),
    [setSettings],
  );

  const handleSoundVolume = useCallback(
    (soundId: string, volume: number) =>
      setSettings((current) => ({
        ...current,
        perSoundVolume: { ...current.perSoundVolume, [soundId]: volume },
      })),
    [setSettings],
  );

  const handleToggleSoundFavorite = useCallback(
    (soundId: string) =>
      setSettings((current) => ({
        ...current,
        favorite: { ...current.favorite, [soundId]: !current.favorite[soundId] },
      })),
    [setSettings],
  );

  const handleToggleMultipleSounds = useCallback(
    (soundIds: string[], enabled: boolean) =>
      setSettings((current) => {
        const nextEnabled = { ...current.enabled };
        for (const id of soundIds) {
          nextEnabled[id] = enabled;
        }
        return { ...current, enabled: nextEnabled };
      }),
    [setSettings],
  );

  const updateTimerPreset = (presetId: string, patch: Partial<TimerPreset>) => {
    setTimerPresets((current) =>
      current.map((preset) => (preset.id === presetId ? { ...preset, ...patch } : preset)),
    );
  };

  const applyScene = (sceneId: string, options?: { autoPlay?: boolean }) => {
    const scene = savedScenes.find((entry) => entry.id === sceneId);
    if (!scene) {
      return;
    }

    setSettings((current) => ({
      ...current,
      enabled: Object.fromEntries(ALL_SOUNDS.map((sound) => [sound.id, scene.soundIds.includes(sound.id)])),
      perSoundVolume: { ...current.perSoundVolume, ...scene.soundVolumes },
      selectedSceneId: scene.id,
      lastAppliedSceneId: scene.id,
    }));

    if (options?.autoPlay) {
      clearFadeInterval();
      setIsPlaying(true);
    }
  };

  const syncSceneFromCurrentMix = (sceneId: string, patch?: Partial<SavedScene>) => {
    setSavedScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              ...patch,
              soundIds: ALL_SOUNDS.filter((sound) => settings.enabled[sound.id]).map((sound) => sound.id),
              soundVolumes: Object.fromEntries(
                ALL_SOUNDS.map((sound) => [
                  sound.id,
                  settings.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6,
                ]),
              ),
              updatedAt: Date.now(),
            }
          : scene,
      ),
    );
  };

  const createSceneFromCurrentMix = (payload: {
    title: string;
    description: string;
    thumbnail: string;
    video: string;
    tags: string[];
  }) => {
    const baseScene = activeScene ?? savedScenes[0];
    const nextScene: SavedScene = {
      id: createId("scene"),
      title: payload.title,
      description: payload.description,
      duration: baseScene?.duration ?? 45,
      tags: payload.tags,
      thumbnail: payload.thumbnail,
      video: payload.video,
      favorite: false,
      isDefault: false,
      soundIds: ALL_SOUNDS.filter((sound) => settings.enabled[sound.id]).map((sound) => sound.id),
      soundVolumes: Object.fromEntries(
        ALL_SOUNDS.map((sound) => [
          sound.id,
          settings.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6,
        ]),
      ),
      updatedAt: Date.now(),
    };

    setSavedScenes((current) => [...current, nextScene]);
    setSettings((current) => ({
      ...current,
      selectedSceneId: nextScene.id,
      lastAppliedSceneId: nextScene.id,
    }));
    setCreatingScene(false);
    setPlayingScene(nextScene);
    return nextScene.id;
  };

  const duplicateScene = (sceneId: string) => {
    const source = savedScenes.find((scene) => scene.id === sceneId);
    if (!source) {
      return null;
    }

    const duplicate: SavedScene = {
      ...source,
      id: createId("scene"),
      title: `${source.title} Copy`,
      favorite: false,
      isDefault: false,
      updatedAt: Date.now(),
    };

    setSavedScenes((current) => [...current, duplicate]);
    setSettings((current) => ({
      ...current,
      selectedSceneId: duplicate.id,
      lastAppliedSceneId: duplicate.id,
    }));
    setPlayingScene(duplicate);
    return duplicate.id;
  };

  const setDefaultScene = (sceneId: string) => {
    setSavedScenes((current) =>
      current.map((scene) => ({
        ...scene,
        isDefault: scene.id === sceneId,
      })),
    );
    setSettings((current) => ({
      ...current,
      selectedSceneId: sceneId,
    }));
  };

  const toggleFavoriteScene = (sceneId: string) => {
    setSavedScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId ? { ...scene, favorite: !scene.favorite, updatedAt: Date.now() } : scene,
      ),
    );
  };

  const deleteScene = (sceneId: string) => {
    if (savedScenes.length <= 1) {
      return false;
    }

    const remaining = savedScenes.filter((scene) => scene.id !== sceneId);
    if (remaining.length === savedScenes.length) {
      return false;
    }

    // Keep exactly one default scene alive even if the deleted one held the flag.
    if (!remaining.some((scene) => scene.isDefault)) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }

    const fallbackScene = remaining.find((scene) => scene.isDefault) ?? remaining[0];

    setSavedScenes(remaining);
    setSettings((current) => ({
      ...current,
      selectedSceneId: current.selectedSceneId === sceneId ? fallbackScene.id : current.selectedSceneId,
      lastAppliedSceneId:
        current.lastAppliedSceneId === sceneId ? fallbackScene.id : current.lastAppliedSceneId,
    }));

    // Any preset pointing at the removed scene falls back too, so the timer
    // never tries to apply a scene that no longer exists.
    setTimerPresets((current) =>
      current.map((preset) =>
        preset.sceneId === sceneId || preset.cycles.some((cycle) => cycle.sceneId === sceneId)
          ? {
              ...preset,
              sceneId: preset.sceneId === sceneId ? fallbackScene.id : preset.sceneId,
              cycles: preset.cycles.map((cycle) =>
                cycle.sceneId === sceneId ? { ...cycle, sceneId: fallbackScene.id } : cycle,
              ),
            }
          : preset,
      ),
    );

    setPlayingScene((current) => (current?.id === sceneId ? null : current));
    return true;
  };

  const exportScene = (sceneId: string) => {
    const scene = savedScenes.find((entry) => entry.id === sceneId);
    if (!scene) {
      return false;
    }
    const payload = JSON.stringify(scene, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scene.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  };

  const selectTimerPreset = (presetId: string) => {
    const preset = timerPresets.find((entry) => entry.id === presetId);
    if (!preset) {
      return null;
    }

    const cycle = getTimerPresetCycle(preset, 0);

    setTimerSession({
      activePresetId: preset.id,
      phase: "focus",
      isRunning: false,
      remainingSeconds: cycle.focusMinutes * 60,
      endsAt: null,
      completedCycles: 0,
      notification: null,
    });
    applyScene(cycle.sceneId ?? preset.sceneId);
    return preset.id;
  };

  const setActiveTimerPreset = (presetId: string) => {
    const preset = timerPresets.find((entry) => entry.id === presetId);
    if (!preset) {
      return;
    }

    const cycle = getTimerPresetCycle(preset, 0);
    setTimerSession((current) => ({
      ...current,
      activePresetId: preset.id,
      phase: "focus",
      isRunning: false,
      remainingSeconds: cycle.focusMinutes * 60,
      endsAt: null,
      notification: null,
      completedCycles: 0,
    }));
  };

  const openFocusSession = () => {
    const preset =
      timerPresets.find((entry) => entry.sceneId === activeScene?.id) ?? timerPresets[0] ?? null;

    if (!preset) {
      return;
    }

    selectTimerPreset(preset.id);
    navigateTo("/timer");
  };

  const openSceneFullscreen = (sceneId: string) => {
    const scene = savedScenes.find((entry) => entry.id === sceneId);
    if (!scene) {
      return;
    }

    navigateTo("/scenes");
    setPlayingScene(scene);
  };

  const resetTimerSession = (phase: TimerPhase = "focus") => {
    if (!activePreset) {
      return;
    }

    const cycle = getTimerPresetCycle(activePreset, timerSession.completedCycles);

    setTimerSession((current) => ({
      ...current,
      phase,
      isRunning: false,
      remainingSeconds:
        (phase === "focus" ? cycle.focusMinutes : cycle.breakMinutes) * 60,
      endsAt: null,
      notification: null,
    }));
  };

  const startPauseTimer = () => {
    if (!activePreset) {
      return;
    }

    const cycle = getTimerPresetCycle(activePreset, timerSession.completedCycles);

    setTimerSession((current) => {
      if (current.isRunning) {
        return { ...current, isRunning: false, endsAt: null };
      }

      const remainingSeconds =
        current.remainingSeconds > 0
          ? current.remainingSeconds
          : (current.phase === "focus" ? cycle.focusMinutes : cycle.breakMinutes) * 60;

      return {
        ...current,
        remainingSeconds,
        isRunning: true,
        endsAt: Date.now() + remainingSeconds * 1000,
      };
    });

    if (cycle.sceneId) {
      applyScene(cycle.sceneId, { autoPlay: true });
    }
  };

  const createTimerPreset = (payload: {
    title: string;
    desc: string;
    focusMinutes: number;
    breakMinutes: number;
    sceneId: string;
    cycleCount: number;
  }) => {
    const sceneId = payload.sceneId || activeScene?.id || savedScenes[0]?.id || "scene-0";
    const nextPreset: TimerPreset = {
      id: createId("preset"),
      title: payload.title,
      desc: payload.desc,
      focusMinutes: payload.focusMinutes,
      breakMinutes: payload.breakMinutes,
      sceneId,
      fadeOutAtEnd: false,
      breakReminders: false,
      autoStartNextSession: false,
      distractionFree: false,
      cycles: Array.from({ length: Math.max(1, payload.cycleCount) }, (_, index) => ({
        id: createId("cycle"),
        label: `Cycle ${index + 1}`,
        focusMinutes: payload.focusMinutes,
        breakMinutes: payload.breakMinutes,
        sceneId,
      })),
    };

    setTimerPresets((current) => [...current, nextPreset]);
    setTimerSession({
      activePresetId: nextPreset.id,
      phase: "focus",
      isRunning: false,
      remainingSeconds: nextPreset.focusMinutes * 60,
      endsAt: null,
      completedCycles: 0,
      notification: null,
    });
    setCreatingPreset(false);
    return nextPreset.id;
  };

  const deleteTimerPreset = (presetId: string) => {
    if (timerPresets.length <= 1) {
      return false;
    }

    const remaining = timerPresets.filter((preset) => preset.id !== presetId);
    if (remaining.length === timerPresets.length) {
      return false;
    }

    setTimerPresets(remaining);
    setTimerSession((current) => {
      if (current.activePresetId !== presetId) {
        return current;
      }
      const fallback = remaining[0];
      return {
        activePresetId: fallback.id,
        phase: "focus",
        isRunning: false,
        remainingSeconds: getTimerPresetCycle(fallback, 0).focusMinutes * 60,
        endsAt: null,
        completedCycles: 0,
        notification: null,
      };
    });
    return true;
  };

  useEffect(() => {
    if (!ready) return;
    // Honour "Auto-play last scene": start the stored mix immediately, otherwise
    // come up paused so launching the app never makes noise unexpectedly.
    const live = settingsRef.current;
    if (live.autoPlayOnLaunch) {
      const lastSceneId = live.lastAppliedSceneId ?? live.selectedSceneId;
      if (lastSceneId) {
        applyScene(lastSceneId);
      }
      setIsPlaying(true);
      return;
    }
    setIsPlaying(false);
  }, [ready]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    void listen("oceanic://toggle-playback", () => setIsPlaying((prev) => !prev))
      .then((off) => (unlisten = off))
      .catch(() => {});
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  useEffect(() => {
    void isEnabled().then(setStartWithWindows).catch(() => {});
  }, []);

  useEffect(() => {
    for (const sound of ALL_SOUNDS) {
      const shouldPlay = isPlaying && settings.enabled[sound.id];
      let audio = audioRef.current[sound.id];
      if (!audio) {
        // Only create (and start preloading) an <audio> element once a sound is
        // actually enabled - creating all of them up front means preloading the
        // entire sound library (tens of MB) on every launch.
        if (!settings.enabled[sound.id]) {
          continue;
        }
        audio = new Audio(sound.file);
        audio.loop = true;
        audio.preload = "auto";
        audioRef.current[sound.id] = audio;
      }
      const per = settings.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6;
      audio.volume = Math.max(0, Math.min(1, settings.masterVolume * per * duckGain));
      if (shouldPlay) {
        void audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [duckGain, isPlaying, settings.enabled, settings.masterVolume, settings.perSoundVolume]);

  useEffect(() => {
    clearSleepTimeout();
    clearFadeStartTimeout();

    if (!isPlaying || settings.sleepTimerMinutes === null) {
      return;
    }

    const totalSleepMs = settings.sleepTimerMinutes * 60_000;
    const totalFadeMs = settings.fadeOutMinutes !== null ? settings.fadeOutMinutes * 60_000 : 0;
    const fadeDuration = totalFadeMs >= totalSleepMs ? Math.max(0, totalSleepMs - 2000) : totalFadeMs;
    const fadeStartDelay = totalSleepMs - fadeDuration;

    if (fadeDuration > 0) {
      fadeStartTimeoutRef.current = window.setTimeout(() => {
        startFadeOutProcess(fadeDuration);
      }, fadeStartDelay);
    }

    sleepTimeoutRef.current = window.setTimeout(async () => {
      setIsPlaying(false);
      try {
        await invoke("put_pc_to_sleep");
      } catch (err) {
        console.error("Failed to sleep PC:", err);
      }
      setSettings((current) => ({ ...current, sleepTimerMinutes: null }));
    }, totalSleepMs);

    return () => {
      clearSleepTimeout();
      clearFadeStartTimeout();
      if (fadeInProgressRef.current) {
        clearFadeInterval();
        restoreAudioVolumes();
      }
    };
    // Intentionally excludes settings.enabled/masterVolume/perSoundVolume: the fade
    // reads live values from settingsRef when it actually fires, so tweaking the mix
    // mid-countdown no longer resets the sleep timer back to its full duration.
  }, [isPlaying, settings.fadeOutMinutes, settings.sleepTimerMinutes]);

  useEffect(() => {
    if (isPlaying) {
      clearFadeInterval();
      restoreAudioVolumes();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!timerSession.isRunning || !timerSession.endsAt || !activePreset) {
      return;
    }

    const tick = window.setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((timerSession.endsAt! - Date.now()) / 1000));
      if (remainingSeconds > 0) {
        setTimerSession((current) => ({ ...current, remainingSeconds }));
        return;
      }

      const currentPreset = activePreset;
      const currentCycle = getTimerPresetCycle(currentPreset, timerSession.completedCycles);
      const nextPhase: TimerPhase = timerSession.phase === "focus" ? "break" : "focus";
      const nextSeconds =
        (nextPhase === "focus"
          ? getTimerPresetCycle(currentPreset, timerSession.completedCycles + 1).focusMinutes
          : currentCycle.breakMinutes) * 60;
      const autoStart = currentPreset.autoStartNextSession;
      const notification =
        nextPhase === "break"
          ? `${currentPreset.title} complete. Time for a ${currentCycle.breakMinutes} min break.`
          : `Break complete. Back into ${currentPreset.title}.`;

      if (currentPreset.fadeOutAtEnd) {
        startFadeOutProcess(Math.max(1000, settings.fadeOutDuration * 1000), restoreAudioVolumes);
      }

      if (nextPhase === "break" && currentPreset.breakReminders) {
        setTimerSession((current) => ({
          ...current,
          notification,
          phase: nextPhase,
          remainingSeconds: nextSeconds,
          isRunning: autoStart,
          endsAt: autoStart ? Date.now() + nextSeconds * 1000 : null,
        }));
      } else {
        setTimerSession((current) => ({
          ...current,
          notification,
          phase: nextPhase,
          remainingSeconds: nextSeconds,
          isRunning: autoStart,
          endsAt: autoStart ? Date.now() + nextSeconds * 1000 : null,
          completedCycles:
            nextPhase === "focus" ? current.completedCycles + 1 : current.completedCycles,
        }));
      }

      if (nextPhase === "focus") {
        const nextCycle = getTimerPresetCycle(currentPreset, timerSession.completedCycles + 1);
        if (nextCycle.sceneId) {
          applyScene(nextCycle.sceneId);
        }
      }
    }, 500);

    return () => {
      window.clearInterval(tick);
    };
  }, [
    activePreset,
    settings.fadeOutDuration,
    timerSession.completedCycles,
    timerSession.endsAt,
    timerSession.isRunning,
    timerSession.phase,
  ]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    document.documentElement.dataset.reduceMotion = String(settings.reduceMotion);
    document.documentElement.dataset.largerUi = String(settings.largerUI);
  }, [settings.largerUI, settings.reduceMotion, settings.theme]);

  useEffect(() => {
    warmSceneVideoCache();
  }, []);

  useEffect(() => {
    if (!navigator.mediaSession || typeof MediaMetadata === "undefined") {
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeScene?.title ?? "Oceanic",
      artist: "Oceanic",
      album: activeScene?.description ?? "Ambient focus",
    });

    if (!settings.globalMediaHotkeys) {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("stop", null);
      return;
    }

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("stop", () => setIsPlaying(false));
  }, [activeScene?.description, activeScene?.title, settings.globalMediaHotkeys]);

  useEffect(() => {
    let appWindow: ReturnType<typeof getCurrentWindow> | null = null;
    try {
      appWindow = getCurrentWindow();
    } catch {
      return;
    }

    let unlistenClose: (() => void) | null = null;

    void appWindow
      .onCloseRequested(async (event) => {
        if (
          closeBypassRef.current ||
          settings.minimizeToTray ||
          !settings.fadeOutOnClose ||
          settings.fadeOutDuration <= 0
        ) {
          return;
        }

        event.preventDefault();
        closeBypassRef.current = true;
        startFadeOutProcess(Math.max(250, settings.fadeOutDuration * 1000), async () => {
          setIsPlaying(false);
          await appWindow.destroy();
        });
      })
      .then((off) => {
        unlistenClose = off;
      })
      .catch(() => {});

    return () => {
      if (unlistenClose) {
        unlistenClose();
      }
    };
  }, [settings.fadeOutDuration, settings.fadeOutOnClose, settings.minimizeToTray]);

  useEffect(() => {
    return () => {
      clearFadeInterval();
      clearSleepTimeout();
      clearFadeStartTimeout();
    };
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | null = null;

    try {
      const win = getCurrentWindow();
      const syncFullscreen = async () => {
        try {
          const full = await win.isFullscreen();
          if (!disposed) setIsFullscreen(full);
        } catch {}
      };
      void syncFullscreen();
      void win.onResized(() => {
        void syncFullscreen();
      }).then((off) => {
        unlisten = off;
      }).catch(() => {});
    } catch {}

    return () => {
      disposed = true;
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden bg-gradient-to-br from-[#091b31eb] to-[#07172af5] ${
      isFullscreen
        ? "rounded-none border-0 shadow-none"
        : "rounded-[18px] border border-[#3980cf6b] shadow-[inset_0_0_0_1px_rgba(144,189,244,0.06)]"
    }`}>
      <Titlebar
        minimizeToTray={settings.minimizeToTray}
        playbackText={isPlaying ? "Currently Playing" : "Paused"}
      />
      <div className="h-[calc(100vh-62px)] flex-1 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <MixerPage
                isPlaying={isPlaying}
                settings={settings}
                activeCount={activeCount}
                activeScene={activeScene}
                savedScenes={savedScenes}
                onTogglePlayback={() => {
                  clearFadeInterval();
                  setIsPlaying((current) => !current);
                }}
                onMasterVolume={handleMasterVolume}
                onToggleSound={handleToggleSound}
                onSoundVolume={handleSoundVolume}
                onToggleFavorite={handleToggleSoundFavorite}
                onToggleMultipleSounds={handleToggleMultipleSounds}
                onApplyScene={(sceneId) => applyScene(sceneId)}
                onSaveScene={(sceneId) => syncSceneFromCurrentMix(sceneId)}
                onCreateScene={() => setCreatingScene(true)}
                onSetDefaultScene={setDefaultScene}
                onManageScenes={() => navigateTo("/scenes")}
                onOpenSceneFullscreen={openSceneFullscreen}
                onOpenFocusSession={openFocusSession}
              />
            }
          />
          <Route
            path="/scenes"
            element={
              <ScenesPage
                scenes={savedScenes}
                selectedSceneId={activeScene?.id ?? null}
                onSelectScene={(sceneId) => setSettings((current) => ({ ...current, selectedSceneId: sceneId }))}
                onPreviewScene={openSceneFullscreen}
                onToggleFavorite={toggleFavoriteScene}
                onDuplicateScene={duplicateScene}
                onExportScene={exportScene}
                onDeleteScene={deleteScene}
                onSetDefaultScene={setDefaultScene}
                onCreateScene={() => setCreatingScene(true)}
              />
            }
          />
          <Route
            path="/timer"
            element={
              <TimerPage
                isPlaying={isPlaying}
                masterVolume={settings.masterVolume}
                presets={timerPresets}
                session={timerSession}
                activePreset={activePreset}
                savedScenes={savedScenes}
                activeScene={activeScene}
                onStartPause={startPauseTimer}
                onReset={() => resetTimerSession(timerSession.phase)}
                onSelectPreset={selectTimerPreset}
                onCreatePreset={() => setCreatingPreset(true)}
                onAdjustFocusMinutes={(delta) => {
                  if (!activePreset) return;
                  const nextFocusMinutes = Math.max(10, Math.min(120, activePreset.focusMinutes + delta));
                  const activeCycleIndex = Math.min(
                    timerSession.completedCycles,
                    Math.max(0, activePreset.cycles.length - 1),
                  );
                  updateTimerPreset(activePreset.id, {
                    focusMinutes: nextFocusMinutes,
                    cycles: activePreset.cycles.map((cycle, index) =>
                      index === activeCycleIndex
                        ? {
                            ...cycle,
                            focusMinutes: nextFocusMinutes,
                          }
                        : cycle,
                    ),
                  });
                  setTimerSession((current) => ({
                    ...current,
                    remainingSeconds:
                      current.phase === "focus"
                        ? nextFocusMinutes * 60
                        : current.remainingSeconds,
                    isRunning: false,
                    endsAt: null,
                  }));
                }}
                onMasterVolume={handleMasterVolume}
                onOpenMixer={() => navigateTo("/")}
                onManagePresets={() => navigateTo("/timer/presets")}
                onDismissNotification={() =>
                  setTimerSession((current) => ({ ...current, notification: null }))
                }
              />
            }
          />
          <Route
            path="/timer/presets"
            element={
              <TimerPresetsPage
                presets={timerPresets}
                scenes={savedScenes}
                activePresetId={timerSession.activePresetId}
                onSelectPreset={setActiveTimerPreset}
                onUpdatePreset={updateTimerPreset}
                onCreatePreset={() => setCreatingPreset(true)}
                onDeletePreset={deleteTimerPreset}
                onOpenTimer={() => navigateTo("/timer")}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                settings={settings}
                startWithWindows={startWithWindows}
                onStartWithWindows={async (enabled) => {
                  try {
                    if (enabled) await enable();
                    else await disable();
                    setStartWithWindows(enabled);
                    if (!enabled) setSettings((current) => ({ ...current, startMinimized: false }));
                  } catch {}
                }}
                updateSettings={(partial) => setSettings((current) => ({ ...current, ...partial }))}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {playingScene && (
        <ScenePlayer
          scene={playingScene}
          onClose={() => {
            setSceneAudioActive(false);
            setPlayingScene(null);
          }}
          onAudibleChange={setSceneAudioActive}
        />
      )}

      {creatingScene && (
        <CreateSceneModal
          defaultVideo={activeScene?.video}
          onCancel={() => setCreatingScene(false)}
          onCreate={createSceneFromCurrentMix}
        />
      )}

      {creatingPreset && (
        <CreatePresetModal
          scenes={savedScenes}
          defaultSceneId={activeScene?.id}
          onCancel={() => setCreatingPreset(false)}
          onCreate={createTimerPreset}
        />
      )}
    </div>
  );
}

export default App;
