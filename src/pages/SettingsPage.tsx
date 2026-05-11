import type { ThemeName, OceanicSettings } from "../lib/types";
import { THEMES } from "../lib/themes";

type Props = {
  settings: OceanicSettings;
  startWithWindows: boolean;
  onMinimizeToTray: (enabled: boolean) => void;
  onStartMinimized: (enabled: boolean) => void;
  onStartWithWindows: (enabled: boolean) => void;
  onTheme: (theme: ThemeName) => void;
  onHideInactive: (enabled: boolean) => void;
  onAutoPlay: (enabled: boolean) => void;
};

export function SettingsPage({
  settings,
  startWithWindows,
  onMinimizeToTray,
  onStartMinimized,
  onStartWithWindows,
  onTheme,
  onHideInactive,
  onAutoPlay,
}: Props) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-10 pt-5 md:px-8">
      <section className="themed-card rounded-3xl border p-5 shadow-panel backdrop-blur md:p-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="themed-text-muted mt-1 text-sm">Desktop behavior, themes, and playback preferences.</p>

        <div className="mt-5 space-y-4">
          <label className="themed-soft flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
            <span className="text-sm font-medium">Minimize/close to tray</span>
            <input type="checkbox" checked={settings.minimizeToTray} onChange={(e) => onMinimizeToTray(e.currentTarget.checked)} className="themed-input h-4 w-4 rounded border" />
          </label>

          <label className="themed-soft flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
            <span className="text-sm font-medium">Start with Windows</span>
            <input type="checkbox" checked={startWithWindows} onChange={(e) => onStartWithWindows(e.currentTarget.checked)} className="themed-input h-4 w-4 rounded border" />
          </label>

          <label className="themed-soft flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
            <span className="text-sm font-medium">Start minimized</span>
            <input type="checkbox" disabled={!startWithWindows} checked={settings.startMinimized} onChange={(e) => onStartMinimized(e.currentTarget.checked)} className="themed-input h-4 w-4 rounded border disabled:cursor-not-allowed disabled:opacity-40" />
          </label>

          <label className="themed-soft flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
            <span className="text-sm font-medium">Autoplay on launch</span>
            <input type="checkbox" checked={settings.autoPlayOnLaunch} onChange={(e) => onAutoPlay(e.currentTarget.checked)} className="themed-input h-4 w-4 rounded border" />
          </label>

          <label className="themed-soft flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
            <span className="text-sm font-medium">Hide inactive sounds</span>
            <input type="checkbox" checked={settings.hideInactiveSounds} onChange={(e) => onHideInactive(e.currentTarget.checked)} className="themed-input h-4 w-4 rounded border" />
          </label>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">Theme</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {THEMES.map((theme) => (
              <button
                key={theme.name}
                type="button"
                onClick={() => onTheme(theme.name)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  settings.theme === theme.name ? "themed-btn-primary border" : "themed-btn-ghost border"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
