import { listen } from "@tauri-apps/api/event";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Titlebar from "./components/Titlebar";
import { useOceanicPreferences } from "./hooks/useOceanicPreferences";
import { ALL_SOUNDS } from "./lib/sounds";
import type { ThemeName } from "./lib/types";
import { MixerPage } from "./pages/MixerPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  const { settings, setSettings, activeCount, ready } = useOceanicPreferences();
  const [isPlaying, setIsPlaying] = useState(true);
  const [startWithWindows, setStartWithWindows] = useState(false);
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});

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
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  return (
    <div className="app-shell min-h-screen text-slate-900">
      <Titlebar minimizeToTray={settings.minimizeToTray} />
      <Routes>
        <Route
          path="/"
          element={
            <MixerPage
              isPlaying={isPlaying}
              settings={settings}
              activeCount={activeCount}
              onTogglePlayback={() => setIsPlaying((prev) => !prev)}
              onMasterVolume={(value) => setSettings((s) => ({ ...s, masterVolume: value }))}
              onToggleSound={(soundId) =>
                setSettings((s) => ({ ...s, enabled: { ...s.enabled, [soundId]: !s.enabled[soundId] } }))
              }
              onSoundVolume={(soundId, volume) =>
                setSettings((s) => ({ ...s, perSoundVolume: { ...s.perSoundVolume, [soundId]: volume } }))
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
              onMinimizeToTray={(enabled) => setSettings((s) => ({ ...s, minimizeToTray: enabled }))}
              onStartMinimized={(enabled) => setSettings((s) => ({ ...s, startMinimized: enabled }))}
              onStartWithWindows={async (enabled) => {
                try {
                  if (enabled) await enable();
                  else await disable();
                  setStartWithWindows(enabled);
                  if (!enabled) setSettings((s) => ({ ...s, startMinimized: false }));
                } catch {}
              }}
              onTheme={(theme: ThemeName) => setSettings((s) => ({ ...s, theme }))}
              onHideInactive={(enabled) => setSettings((s) => ({ ...s, hideInactiveSounds: enabled }))}
              onAutoPlay={(enabled) => setSettings((s) => ({ ...s, autoPlayOnLaunch: enabled }))}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
