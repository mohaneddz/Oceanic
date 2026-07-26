import { Link } from "react-router-dom";
import {
  CircleHelp,
  Clock3,
  Eye,
  Monitor,
  MousePointerClick,
  PlayCircle,
  Power,
  Settings,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
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
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#e8f1ff] transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const sidebarItems: { label: string; id: string; Icon: LucideIcon }[] = [
  { label: "Startup & Tray", id: "startup", Icon: Power },
  { label: "Playback", id: "playback", Icon: PlayCircle },
  { label: "Automation", id: "automation", Icon: Timer },
  { label: "Interface", id: "interface", Icon: Monitor },
  { label: "Accessibility", id: "accessibility", Icon: MousePointerClick },
  { label: "About", id: "about", Icon: CircleHelp },
];

const panelClass =
  "rounded-2xl border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]";
const rowClass =
  "flex flex-col gap-3 border-b border-[#6a94c526] bg-[#0c233c80] px-3 py-3 last:border-b-0 md:flex-row md:items-center md:justify-between";

const buttonPillClass =
  "rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-3 py-1.5 text-sm text-[#9fb4ca] transition-colors hover:border-[#6c9dd666] hover:bg-[#15345775]";

function SettingSection({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article id={id} className={`${panelClass} scroll-mt-4 p-3`}>
      <div className="mb-3 flex items-start gap-3 border-b border-[#6a94c526] pb-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#78a5db3d] bg-[#133150b3] text-[#c4d6eb]">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-3xl font-semibold leading-none">{title}</h2>
          <p className="mt-2 text-sm text-[#91a7bf]">{description}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#6a94c533]">{children}</div>
    </article>
  );
}

export function SettingsPage({
  settings,
  startWithWindows,
  onStartWithWindows,
  updateSettings,
}: Props) {
  return (
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <div className="grid h-full gap-3 min-[1500px]:grid-cols-1 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-2 rounded-2xl border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] p-3 shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)] min-[1500px]:hidden">
          <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">SETTINGS</p>
          {sidebarItems.map(({ label, id, Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-base text-[#d7e5f4] no-underline transition hover:border-[#6a94c547] hover:bg-[#102b488f] hover:text-white"
            >
              <Icon size={16} /> {label}
            </a>
          ))}

          <Link
            to="/"
            className="mt-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-center text-sm text-[#dbe9f8] no-underline"
          >
            Back to Mixer
          </Link>
        </aside>

        <section className="min-h-0 overflow-auto pr-1">
          <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-5xl font-semibold leading-none">Settings</h1>
              <p className="mt-2 max-w-3xl text-base text-[#91a7bf]">
                Everything is on one page now. The sidebar only jumps between sections, and it hides
                automatically on wider layouts where the cards can stand on their own.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] no-underline"
            >
              Back to Mixer
            </Link>
          </header>

          <div className="grid gap-3 min-[1100px]:grid-cols-2">
            <SettingSection
              id="startup"
              icon={Power}
              title="Startup & Tray"
              description="Control launch behavior and how the app behaves when you close it."
            >
              <div className={rowClass}>
                <div>
                  <p className="text-base">Launch on startup</p>
                  <p className="text-sm text-[#91a7bf]">
                    Automatically launch Oceanic when you sign in to Windows.
                  </p>
                </div>
                <Toggle checked={startWithWindows} onToggle={() => onStartWithWindows(!startWithWindows)} />
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Start minimized to tray</p>
                  <p className="text-sm text-[#91a7bf]">Oceanic will start in the system tray.</p>
                </div>
                <Toggle
                  checked={settings.startMinimized}
                  disabled={!startWithWindows}
                  onToggle={() => updateSettings({ startMinimized: !settings.startMinimized })}
                />
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Auto-play last scene</p>
                  <p className="text-sm text-[#91a7bf]">
                    Automatically resume the last active scene when the app starts.
                  </p>
                </div>
                <Toggle
                  checked={settings.autoPlayOnLaunch}
                  onToggle={() => updateSettings({ autoPlayOnLaunch: !settings.autoPlayOnLaunch })}
                />
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Close and minimize to tray</p>
                  <p className="text-sm text-[#91a7bf]">
                    Keep playing while hidden in your system tray.
                  </p>
                </div>
                <Toggle
                  checked={settings.minimizeToTray}
                  onToggle={() => updateSettings({ minimizeToTray: !settings.minimizeToTray })}
                />
              </div>
            </SettingSection>

            <SettingSection
              id="playback"
              icon={PlayCircle}
              title="Playback"
              description="Adjust sound behavior, fading, and the mix surface itself."
            >
              <div className={rowClass}>
                <div>
                  <p className="text-base">Hide inactive sounds</p>
                  <p className="text-sm text-[#91a7bf]">
                    Automatically hide sounds that have not been used in a scene.
                  </p>
                </div>
                <Toggle
                  checked={settings.hideInactiveSounds}
                  onToggle={() => updateSettings({ hideInactiveSounds: !settings.hideInactiveSounds })}
                />
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Audio ducking</p>
                  <p className="text-sm text-[#91a7bf]">
                    Lower the ambient mix while a scene video is playing with its own sound.
                  </p>
                </div>
                <Toggle
                  checked={settings.audioDucking}
                  onToggle={() => updateSettings({ audioDucking: !settings.audioDucking })}
                />
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Fade out when closing</p>
                  <p className="text-sm text-[#91a7bf]">
                    Gradually fade out all audio when the app closes or is quit.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Toggle
                    checked={settings.fadeOutOnClose}
                    onToggle={() => updateSettings({ fadeOutOnClose: !settings.fadeOutOnClose })}
                  />
                  <div className="flex items-center gap-2">
                    {[1, 3, 5, 10].map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={!settings.fadeOutOnClose}
                        onClick={() => updateSettings({ fadeOutDuration: value })}
                        className={`${buttonPillClass} disabled:cursor-not-allowed disabled:opacity-40 ${
                          settings.fadeOutDuration === value
                            ? "border-[#5d97e6cc] bg-[#2264b7b8] text-white"
                            : ""
                        }`}
                      >
                        {value}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Master volume</p>
                  <p className="text-sm text-[#91a7bf]">Control the app-wide audio gain.</p>
                </div>
                <div className="flex min-w-[16rem] items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.masterVolume}
                    onChange={(event) => updateSettings({ masterVolume: Number(event.currentTarget.value) })}
                    className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#2d7de4] accent-[#2f89ff]"
                  />
                  <span className="w-14 shrink-0 text-right text-sm text-[#9db2c9]">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
              </div>
            </SettingSection>

            <SettingSection
              id="automation"
              icon={Timer}
              title="Automation"
              description="Sleep timer and automatic fade timing are grouped here."
            >
              <div className={rowClass}>
                <div>
                  <p className="text-base">Sleep timer</p>
                  <p className="text-sm text-[#91a7bf]">
                    Shut everything down automatically after a set amount of time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[null, 30, 60, 90, 120].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => updateSettings({ sleepTimerMinutes: value })}
                      className={`${buttonPillClass} ${
                        settings.sleepTimerMinutes === value
                          ? "border-[#5d97e6cc] bg-[#2264b7b8] text-white"
                          : ""
                      }`}
                    >
                      {value === null ? "Off" : `${value}m`}
                    </button>
                  ))}
                </div>
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Fade before sleep</p>
                  <p className="text-sm text-[#91a7bf]">
                    If a sleep timer is active, fade audio before the final shutdown.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Toggle
                    checked={settings.fadeOutMinutes !== null}
                    onToggle={() =>
                      updateSettings({
                        fadeOutMinutes: settings.fadeOutMinutes === null ? 30 : null,
                      })
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    {[15, 30, 45, 60].map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={settings.fadeOutMinutes === null}
                        onClick={() => updateSettings({ fadeOutMinutes: value })}
                        className={`${buttonPillClass} disabled:cursor-not-allowed disabled:opacity-40 ${
                          settings.fadeOutMinutes === value
                            ? "border-[#5d97e6cc] bg-[#2264b7b8] text-white"
                            : ""
                        }`}
                      >
                        {value}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SettingSection>

            <SettingSection
              id="interface"
              icon={Settings}
              title="Interface"
              description="Choose the app theme and system integration behavior."
            >
              <div className={rowClass}>
                <div>
                  <p className="text-base">Theme</p>
                  <p className="text-sm text-[#91a7bf]">Choose your preferred app theme.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => updateSettings({ theme: theme.name })}
                      className={`${buttonPillClass} ${
                        settings.theme === theme.name
                          ? "border-[#5d97e6cc] bg-[#2264b7b8] text-white"
                          : ""
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Media key integration</p>
                  <p className="text-sm text-[#91a7bf]">
                    Expose play and pause controls through the system media session when supported.
                  </p>
                </div>
                <Toggle
                  checked={settings.globalMediaHotkeys}
                  onToggle={() => updateSettings({ globalMediaHotkeys: !settings.globalMediaHotkeys })}
                />
              </div>
            </SettingSection>

            <SettingSection
              id="accessibility"
              icon={Eye}
              title="Accessibility"
              description="Reduce motion and scale the UI up when needed."
            >
              <div className={rowClass}>
                <div>
                  <p className="text-base">Reduce motion</p>
                  <p className="text-sm text-[#91a7bf]">Minimize animations and visual effects.</p>
                </div>
                <Toggle
                  checked={settings.reduceMotion}
                  onToggle={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
                />
              </div>
              <div className={rowClass}>
                <div>
                  <p className="text-base">Larger UI</p>
                  <p className="text-sm text-[#91a7bf]">Increase the whole interface scale slightly.</p>
                </div>
                <Toggle
                  checked={settings.largerUI}
                  onToggle={() => updateSettings({ largerUI: !settings.largerUI })}
                />
              </div>
            </SettingSection>

            <SettingSection
              id="about"
              icon={CircleHelp}
              title="About"
              description="Project information and a quick reminder of what Oceanic is for."
            >
              <div className="bg-[#0c233c80] p-4">
                <p className="text-sm text-[#dbe9f8]">
                  Oceanic is a background ambient noise generator aimed at keeping you focused and
                  relaxed.
                </p>
                <p className="mt-2 text-sm text-[#91a7bf]">
                  This project is built using Tauri, React, and Vite.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#9fb4ca]">
                  <span className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-3 py-1">
                    Settings are now section-based
                  </span>
                  <span className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-3 py-1">
                    Sidebar is only a table of contents
                  </span>
                </div>
              </div>
            </SettingSection>
          </div>

          <footer className="mt-3 flex justify-between px-1 text-xs text-[#91a7bf]">
            <span>Thank you for supporting calm focus and better days.</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} /> v1.4.2
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
