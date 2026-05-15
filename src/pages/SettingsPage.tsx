import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CircleHelp,
  Eye,
  Monitor,
  MousePointerClick,
  PlayCircle,
  Power,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { THEMES } from "../lib/themes";
import type { OceanicSettings } from "../lib/types";

type Props = {
  settings: OceanicSettings;
  startWithWindows: boolean;
  onStartWithWindows: (enabled: boolean) => void;
  updateSettings: (partial: Partial<OceanicSettings>) => void;
};

function Toggle({
  checked,
  onToggle = () => {},
  disabled = false,
}: {
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative h-5 w-10 rounded-full border transition ${
        checked
          ? "border-[#5d99e9d9] bg-gradient-to-b from-[#2a87ff] to-[#246fd6]"
          : "border-[#6c9dd647] bg-[#7b96b45c]"
      } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
      aria-pressed={checked}
    >
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#e8f1ff] transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

const sidebarItems: { label: string; id: string; Icon: LucideIcon }[] = [
  { label: "Startup & Tray", id: "startup", Icon: Power },
  { label: "Playback", id: "playback", Icon: PlayCircle },
  { label: "Interface", id: "interface", Icon: Monitor },
  { label: "Accessibility", id: "accessibility", Icon: MousePointerClick },
  { label: "About", id: "about", Icon: CircleHelp },
];

const panelClass = "rounded-2xl border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]";
const rowClass = "flex items-center justify-between gap-3 border-b border-[#6a94c526] bg-[#0c233c80] px-3 py-3 last:border-b-0";

export function SettingsPage({
  settings,
  startWithWindows,
  onStartWithWindows,
  updateSettings,
}: Props) {
  const [activeTab, setActiveTab] = useState("startup");

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <div className="grid h-full grid-cols-[270px_minmax(0,1fr)] gap-3 max-[1400px]:grid-cols-1">
        <aside className={`${panelClass} flex flex-col gap-2 p-3`}>
          <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">SETTINGS</p>
          {sidebarItems.map(({ label, id, Icon }) => (
            <button
              key={id}
              type="button"
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-base ${
                activeTab === id
                  ? "border-[#5b95e0b8] bg-[#2d82ea33] text-white"
                  : "border-transparent text-[#d7e5f4] hover:border-[#6a94c547] hover:bg-[#102b488f]"
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}

          <Link to="/" className="mt-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-center text-sm text-[#dbe9f8] no-underline">
            Back to Mixer
          </Link>
        </aside>

        <section className="min-h-0 overflow-auto">
          {activeTab === "startup" && (
            <article className={`${panelClass} p-3`}>
              <h2 className="mb-2 flex items-center gap-2 text-3xl font-semibold"><Power size={18} /> Startup & Tray</h2>
              <div className="overflow-hidden rounded-xl border border-[#6a94c533]">
                <div className={rowClass}>
                  <div>
                    <p className="text-base">Launch on startup</p>
                    <p className="text-sm text-[#91a7bf]">Automatically launch Oceanic when you sign in to Windows.</p>
                  </div>
                  <Toggle checked={startWithWindows} onToggle={() => onStartWithWindows(!startWithWindows)} />
                </div>
                <div className={rowClass}>
                  <div>
                    <p className="text-base">Start minimized to tray</p>
                    <p className="text-sm text-[#91a7bf]">Oceanic will start in the system tray.</p>
                  </div>
                  <Toggle checked={settings.startMinimized} disabled={!startWithWindows} onToggle={() => updateSettings({ startMinimized: !settings.startMinimized })} />
                </div>
                <div className={rowClass}>
                  <div>
                    <p className="text-base">Auto-play last scene</p>
                    <p className="text-sm text-[#91a7bf]">Automatically resume the last active scene when the app starts.</p>
                  </div>
                  <Toggle checked={settings.autoPlayOnLaunch} onToggle={() => updateSettings({ autoPlayOnLaunch: !settings.autoPlayOnLaunch })} />
                </div>
                <div className={rowClass}>
                  <div>
                    <p className="text-base">Close and minimize to tray</p>
                    <p className="text-sm text-[#91a7bf]">Keep playing while hidden in your system tray.</p>
                  </div>
                  <Toggle checked={settings.minimizeToTray} onToggle={() => updateSettings({ minimizeToTray: !settings.minimizeToTray })} />
                </div>
              </div>
            </article>
          )}

          {activeTab === "playback" && (
            <article className={`${panelClass} p-3`}>
              <h2 className="mb-2 flex items-center gap-2 text-3xl font-semibold"><PlayCircle size={18} /> Playback</h2>
              <div className="overflow-hidden rounded-xl border border-[#6a94c533]">
                <div className={rowClass}>
                  <div><p className="text-base">Hide inactive sounds</p><p className="text-sm text-[#91a7bf]">Automatically hide sounds that have not been used in a scene.</p></div>
                  <Toggle checked={settings.hideInactiveSounds} onToggle={() => updateSettings({ hideInactiveSounds: !settings.hideInactiveSounds })} />
                </div>
                <div className={rowClass}>
                  <div><p className="text-base">Audio ducking while other apps speak</p><p className="text-sm text-[#91a7bf]">Lower Oceanic volume when other apps are using your microphone.</p></div>
                  <Toggle checked={settings.audioDucking} onToggle={() => updateSettings({ audioDucking: !settings.audioDucking })} />
                </div>
                <div className={rowClass}>
                  <div><p className="text-base">Fade out when closing</p><p className="text-sm text-[#91a7bf]">Gradually fade out all audio when the app closes or is quit.</p></div>
                  <div className="flex items-center gap-2">
                    <Toggle checked={settings.fadeOutOnClose} onToggle={() => updateSettings({ fadeOutOnClose: !settings.fadeOutOnClose })} />
                    <button
                      type="button"
                      className="rounded-lg border border-[#6a94c552] bg-[#102b488f] px-3 py-1.5 text-sm text-[#dbe9f8] disabled:opacity-40"
                      disabled={!settings.fadeOutOnClose}
                      onClick={() => {
                        const dr = [1, 3, 5, 10];
                        const next = dr[(dr.indexOf(settings.fadeOutDuration) + 1) % dr.length];
                        updateSettings({ fadeOutDuration: next || 3 });
                      }}
                    >
                      {settings.fadeOutDuration} sec
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}

          {activeTab === "interface" && (
            <article className={`${panelClass} p-3`}>
              <h2 className="mb-2 flex items-center gap-2 text-3xl font-semibold"><Settings size={18} /> Interface</h2>
              <div className="overflow-hidden rounded-xl border border-[#6a94c533]">
                <div className={rowClass}>
                  <div><p className="text-base">Theme</p><p className="text-sm text-[#91a7bf]">Choose your preferred app theme.</p></div>
                  <div className="flex gap-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.name}
                        type="button"
                        onClick={() => updateSettings({ theme: theme.name })}
                        className={`rounded-lg border px-2 py-1 text-xs uppercase ${
                          settings.theme === theme.name
                            ? "border-[#5d97e6cc] bg-[#2264b7b8] text-white"
                            : "border-[#6a94c552] bg-[#102b488f] text-[#d4e4f6]"
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={rowClass}>
                  <div><p className="text-base">Global media hotkeys</p><p className="text-sm text-[#91a7bf]">Use media keys to control playback when Oceanic is in the background.</p></div>
                  <Toggle checked={settings.globalMediaHotkeys} onToggle={() => updateSettings({ globalMediaHotkeys: !settings.globalMediaHotkeys })} />
                </div>
              </div>
            </article>
          )}

          {activeTab === "accessibility" && (
            <article className={`${panelClass} p-3`}>
              <h2 className="mb-2 flex items-center gap-2 text-3xl font-semibold"><Eye size={18} /> Accessibility</h2>
              <div className="overflow-hidden rounded-xl border border-[#6a94c533]">
                <div className={rowClass}>
                  <div><p className="text-base">Reduce motion</p><p className="text-sm text-[#91a7bf]">Minimize animations and visual effects across the app.</p></div>
                  <Toggle checked={settings.reduceMotion} onToggle={() => updateSettings({ reduceMotion: !settings.reduceMotion })} />
                </div>
                <div className={rowClass}>
                  <div><p className="text-base">Larger UI</p><p className="text-sm text-[#91a7bf]">Increase UI size for easier viewing and interaction.</p></div>
                  <Toggle checked={settings.largerUI} onToggle={() => updateSettings({ largerUI: !settings.largerUI })} />
                </div>
              </div>
            </article>
          )}

          {activeTab === "about" && (
            <article className={`${panelClass} p-3`}>
              <h2 className="mb-2 flex items-center gap-2 text-3xl font-semibold"><CircleHelp size={18} /> About</h2>
              <div className="rounded-xl border border-[#6a94c533] bg-[#0c233c80] p-4">
                <p className="text-sm text-[#dbe9f8]">Oceanic is a background ambient noise generator aimed at keeping you focused and relaxed.</p>
                <p className="mt-2 text-sm text-[#91a7bf]">This project is built using Tauri, React, and Vite.</p>
              </div>
            </article>
          )}

          <footer className="mt-3 flex justify-between px-1 text-xs text-[#91a7bf]">
            <span>Thank you for supporting calm focus and better days.</span>
            <span>v1.4.2</span>
          </footer>
        </section>
      </div>
    </main>
  );
}