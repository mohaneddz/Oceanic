import { listen } from "@tauri-apps/api/event";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Titlebar from "./components/Titlebar";
import { useOceanicPreferences } from "./hooks/useOceanicPreferences";
import { ALL_SOUNDS } from "./lib/sounds";
import { MixerPage } from "./pages/MixerPage";
import { ScenesPage } from "./pages/ScenesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TimerPage } from "./pages/TimerPage";
import { ScenePlayer } from "./components/ScenePlayer";
import { SceneItem } from "./lib/scenes";
import { warmSceneVideoCache } from "./lib/videoCache";

function App() {
  const { settings, setSettings, activeCount, ready } = useOceanicPreferences();
  const [isPlaying, setIsPlaying] = useState(true);
  const [startWithWindows, setStartWithWindows] = useState(false);
  const [playingScene, setPlayingScene] = useState<SceneItem | null>(null);

  const audioRef = useRef<Record<string, HTMLAudioElement>>({});
  const fadeIntervalRef = useRef<number | null>(null);
  const sleepTimeoutRef = useRef<number | null>(null);
  const fadeInProgressRef = useRef(false);

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

  const stopPlaybackWithFade = () => {
    if (!isPlaying || fadeInProgressRef.current) {
      return;
    }

    const fadeMinutes = settings.fadeOutMinutes ?? 0;
    if (fadeMinutes <= 0) {
      setIsPlaying(false);
      return;
    }

    const audible = ALL_SOUNDS.filter((sound) => settings.enabled[sound.id]).map((sound) => ({
      audio: audioRef.current[sound.id],
      baseVolume: Math.max(0, Math.min(1, settings.masterVolume * (settings.perSoundVolume[sound.id] ?? 0.6))),
    }));

    if (!audible.length) {
      setIsPlaying(false);
      return;
    }

    clearFadeInterval();
    fadeInProgressRef.current = true;

    const totalMs = Math.max(500, Math.round(fadeMinutes * 60_000));
    const stepMs = 200;
    const steps = Math.max(1, Math.ceil(totalMs / stepMs));
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
        setIsPlaying(false);
      }
    }, stepMs);
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
      const per = settings.perSoundVolume[sound.id] ?? 0.6;
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

    if (!isPlaying || settings.sleepTimerMinutes === null) {
      return;
    }

    sleepTimeoutRef.current = window.setTimeout(() => {
      stopPlaybackWithFade();
      setSettings((s) => ({ ...s, sleepTimerMinutes: null }));
    }, settings.sleepTimerMinutes * 60_000);

    return () => {
      clearSleepTimeout();
    };
  }, [isPlaying, settings.sleepTimerMinutes, settings.fadeOutMinutes, settings.enabled, settings.masterVolume, settings.perSoundVolume]);

  useEffect(() => {
    if (isPlaying) {
      clearFadeInterval();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      clearFadeInterval();
      clearSleepTimeout();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    warmSceneVideoCache();
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
              onTogglePlayback={() => {
                clearFadeInterval();
                setIsPlaying(!isPlaying);
              }}
              onMasterVolume={(value) => setSettings((s) => ({ ...s, masterVolume: value }))}
              onToggleSound={(soundId) =>
                setSettings((s) => ({ ...s, enabled: { ...s.enabled, [soundId]: !s.enabled[soundId] } }))
              }
              onSoundVolume={(soundId, volume) =>
                setSettings((s) => ({ ...s, perSoundVolume: { ...s.perSoundVolume, [soundId]: volume } }))
              }
              onToggleFavorite={(soundId) =>
                setSettings((s) => ({ ...s, favorite: { ...s.favorite, [soundId]: !s.favorite[soundId] } }))
              }
              onSleepTimer={(minutes) => setSettings((s) => ({ ...s, sleepTimerMinutes: minutes }))}
              onFadeOut={(minutes) => setSettings((s) => ({ ...s, fadeOutMinutes: minutes }))}
              onToggleAutoPlayOnLaunch={() =>
                setSettings((s) => ({ ...s, autoPlayOnLaunch: !s.autoPlayOnLaunch }))
              }
            />
          }
        />
        <Route path="/scenes" element={<ScenesPage onPlayScene={setPlayingScene} />} />
        <Route path="/timer" element={<TimerPage />} />
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
                  if (!enabled) setSettings((s) => ({ ...s, startMinimized: false }));
                } catch {}
              }}
              updateSettings={(partial) => setSettings((s) => ({ ...s, ...partial }))}
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

