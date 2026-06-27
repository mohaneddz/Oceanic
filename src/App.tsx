import { listen } from "@tauri-apps/api/event";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Titlebar from "./components/Titlebar";
import { useOceanicPreferences } from "./hooks/useOceanicPreferences";
import { ALL_SOUNDS } from "./lib/sounds";
import type { SavedScene, TimerPhase, TimerPreset } from "./lib/types";
import { MixerPage } from "./pages/MixerPage";
import { ScenesPage } from "./pages/ScenesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TimerPage } from "./pages/TimerPage";
import { ScenePlayer } from "./components/ScenePlayer";
import { warmSceneVideoCache } from "./lib/videoCache";

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

  const audioRef = useRef<Record<string, HTMLAudioElement>>({});
  const fadeIntervalRef = useRef<number | null>(null);
  const sleepTimeoutRef = useRef<number | null>(null);
  const fadeStartTimeoutRef = useRef<number | null>(null);
  const fadeInProgressRef = useRef(false);
  const closeBypassRef = useRef(false);

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
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
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
    for (const sound of ALL_SOUNDS) {
      const audio = audioRef.current[sound.id];
      if (audio) {
        const per = settings.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6;
        audio.volume = Math.max(0, Math.min(1, settings.masterVolume * per));
      }
    }
  };

  const startFadeOutProcess = (durationMs: number, onComplete?: () => void) => {
    if (durationMs <= 0) {
      onComplete?.();
      return;
    }

    const audible = ALL_SOUNDS.filter((sound) => settings.enabled[sound.id]).map((sound) => ({
      audio: audioRef.current[sound.id],
      baseVolume: Math.max(
        0,
        Math.min(
          1,
          settings.masterVolume * (settings.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6),
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

  const createSceneFromCurrentMix = (title?: string) => {
    const name = title?.trim() || window.prompt("Scene name", `${activeScene?.title ?? "New"} Mix`)?.trim();
    if (!name) {
      return;
    }

    const baseScene = activeScene ?? savedScenes[0];
    const nextScene: SavedScene = {
      id: `scene-${Date.now()}`,
      title: name,
      description: `Saved from the current mixer state on ${new Date().toLocaleDateString()}.`,
      duration: baseScene?.duration ?? 45,
      tags: [...(baseScene?.tags ?? ["Custom"]), "Custom"],
      thumbnail: baseScene?.thumbnail ?? savedScenes[0]?.thumbnail ?? "",
      video: baseScene?.video ?? savedScenes[0]?.video ?? "",
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
  };

  const duplicateScene = (sceneId: string) => {
    const source = savedScenes.find((scene) => scene.id === sceneId);
    if (!source) {
      return;
    }

    const duplicate: SavedScene = {
      ...source,
      id: `scene-${Date.now()}`,
      title: `${source.title} Copy`,
      favorite: false,
      isDefault: false,
      updatedAt: Date.now(),
    };

    setSavedScenes((current) => [...current, duplicate]);
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

  const exportScene = (sceneId: string) => {
    const scene = savedScenes.find((entry) => entry.id === sceneId);
    if (!scene) {
      return;
    }
    const payload = JSON.stringify(scene, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scene.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectTimerPreset = (presetId: string) => {
    const preset = timerPresets.find((entry) => entry.id === presetId);
    if (!preset) {
      return;
    }

    setTimerSession({
      activePresetId: preset.id,
      phase: "focus",
      isRunning: false,
      remainingSeconds: preset.focusMinutes * 60,
      endsAt: null,
      completedCycles: 0,
      notification: null,
    });
    applyScene(preset.sceneId);
  };

  const resetTimerSession = (phase: TimerPhase = "focus") => {
    if (!activePreset) {
      return;
    }

    setTimerSession((current) => ({
      ...current,
      phase,
      isRunning: false,
      remainingSeconds:
        (phase === "focus" ? activePreset.focusMinutes : activePreset.breakMinutes) * 60,
      endsAt: null,
      notification: null,
    }));
  };

  const startPauseTimer = () => {
    if (!activePreset) {
      return;
    }

    setTimerSession((current) => {
      if (current.isRunning) {
        return { ...current, isRunning: false, endsAt: null };
      }

      const remainingSeconds =
        current.remainingSeconds > 0
          ? current.remainingSeconds
          : (current.phase === "focus" ? activePreset.focusMinutes : activePreset.breakMinutes) * 60;

      return {
        ...current,
        remainingSeconds,
        isRunning: true,
        endsAt: Date.now() + remainingSeconds * 1000,
      };
    });

    if (activePreset.sceneId) {
      applyScene(activePreset.sceneId, { autoPlay: true });
    }
  };

  const createTimerPreset = () => {
    const title = window.prompt("Preset name", `Custom ${timerPresets.length + 1}`)?.trim();
    if (!title) {
      return;
    }

    const nextPreset: TimerPreset = {
      id: `preset-${Date.now()}`,
      title,
      desc: "Personal focus flow preset.",
      focusMinutes: 40,
      breakMinutes: 10,
      sceneId: activeScene?.id ?? savedScenes[0]?.id ?? "scene-0",
      fadeOutAtEnd: false,
      breakReminders: false,
      autoStartNextSession: false,
      distractionFree: false,
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
  };

  useEffect(() => {
    if (!ready) return;
    setIsPlaying(settings.autoPlayOnLaunch);
  }, [ready, settings.autoPlayOnLaunch]);

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
      let audio = audioRef.current[sound.id];
      if (!audio) {
        audio = new Audio(sound.file);
        audio.loop = true;
        audio.preload = "auto";
        audioRef.current[sound.id] = audio;
      }
      const per = settings.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6;
      audio.volume = Math.max(0, Math.min(1, settings.masterVolume * per));
      const shouldPlay = isPlaying && settings.enabled[sound.id];
      if (shouldPlay) {
        void audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, settings.enabled, settings.masterVolume, settings.perSoundVolume]);

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
        const { invoke } = await import("@tauri-apps/api/core");
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
  }, [isPlaying, settings.enabled, settings.fadeOutMinutes, settings.masterVolume, settings.perSoundVolume, settings.sleepTimerMinutes]);

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
      const nextPhase: TimerPhase = timerSession.phase === "focus" ? "break" : "focus";
      const nextSeconds =
        (nextPhase === "focus" ? currentPreset.focusMinutes : currentPreset.breakMinutes) * 60;
      const autoStart = currentPreset.autoStartNextSession;
      const notification =
        nextPhase === "break"
          ? `${currentPreset.title} complete. Time for a ${currentPreset.breakMinutes} min break.`
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

      if (nextPhase === "focus" && currentPreset.sceneId) {
        applyScene(currentPreset.sceneId);
      }
    }, 500);

    return () => {
      window.clearInterval(tick);
    };
  }, [activePreset, settings.fadeOutDuration, timerSession.endsAt, timerSession.isRunning, timerSession.phase]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    document.documentElement.dataset.reduceMotion = String(settings.reduceMotion);
    document.documentElement.dataset.largerUi = String(settings.largerUI);
  }, [settings.largerUI, settings.reduceMotion, settings.theme]);

  useEffect(() => {
    warmSceneVideoCache();
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
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
    const appWindow = getCurrentWindow();
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

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-[18px] border border-[#3980cf6b] bg-gradient-to-br from-[#091b31eb] to-[#07172af5] shadow-[inset_0_0_0_1px_rgba(144,189,244,0.06)]">
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
                onMasterVolume={(value) => setSettings((current) => ({ ...current, masterVolume: value }))}
                onToggleSound={(soundId) =>
                  setSettings((current) => ({
                    ...current,
                    enabled: { ...current.enabled, [soundId]: !current.enabled[soundId] },
                  }))
                }
                onSoundVolume={(soundId, volume) =>
                  setSettings((current) => ({
                    ...current,
                    perSoundVolume: { ...current.perSoundVolume, [soundId]: volume },
                  }))
                }
                onToggleFavorite={(soundId) =>
                  setSettings((current) => ({
                    ...current,
                    favorite: { ...current.favorite, [soundId]: !current.favorite[soundId] },
                  }))
                }
                onSleepTimer={(minutes) => setSettings((current) => ({ ...current, sleepTimerMinutes: minutes }))}
                onFadeOut={(minutes) => setSettings((current) => ({ ...current, fadeOutMinutes: minutes }))}
                onToggleAutoPlayOnLaunch={() =>
                  setSettings((current) => ({ ...current, autoPlayOnLaunch: !current.autoPlayOnLaunch }))
                }
                onToggleMultipleSounds={(soundIds, enabled) =>
                  setSettings((current) => {
                    const nextEnabled = { ...current.enabled };
                    for (const id of soundIds) {
                      nextEnabled[id] = enabled;
                    }
                    return { ...current, enabled: nextEnabled };
                  })
                }
                onSelectScene={(sceneId) => applyScene(sceneId)}
                onSaveScene={(sceneId) => syncSceneFromCurrentMix(sceneId)}
                onCreateScene={() => createSceneFromCurrentMix()}
                onSetDefaultScene={setDefaultScene}
                onManageScenes={() => navigateTo("/scenes")}
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
                onApplyScene={(sceneId) => applyScene(sceneId, { autoPlay: true })}
                onPreviewScene={(sceneId) => {
                  const scene = savedScenes.find((entry) => entry.id === sceneId);
                  if (scene) {
                    setPlayingScene(scene);
                  }
                }}
                onToggleFavorite={toggleFavoriteScene}
                onDuplicateScene={duplicateScene}
                onExportScene={exportScene}
                onSetDefaultScene={setDefaultScene}
                onCreateScene={() => createSceneFromCurrentMix()}
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
                onUpdatePreset={updateTimerPreset}
                onCreatePreset={createTimerPreset}
                onAdjustFocusMinutes={(delta) => {
                  if (!activePreset) return;
                  const nextFocusMinutes = Math.max(10, Math.min(120, activePreset.focusMinutes + delta));
                  updateTimerPreset(activePreset.id, { focusMinutes: nextFocusMinutes });
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
                onChangeScene={(sceneId) => {
                  if (!activePreset) return;
                  updateTimerPreset(activePreset.id, { sceneId });
                  applyScene(sceneId);
                }}
                onMasterVolume={(value) => setSettings((current) => ({ ...current, masterVolume: value }))}
                onOpenMixer={() => navigateTo("/")}
                onDismissNotification={() =>
                  setTimerSession((current) => ({ ...current, notification: null }))
                }
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
        <ScenePlayer scene={playingScene} onClose={() => setPlayingScene(null)} />
      )}
    </div>
  );
}

export default App;
