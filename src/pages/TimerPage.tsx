import {
  Bell,
  Headphones,
  Layers3,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getTimerPresetCycle } from "../lib/oceanicState";
import type { SavedScene, TimerPreset, TimerSessionState } from "../lib/types";

type TimerPageProps = {
  isPlaying: boolean;
  masterVolume: number;
  presets: TimerPreset[];
  session: TimerSessionState;
  activePreset: TimerPreset | null;
  savedScenes: SavedScene[];
  activeScene: SavedScene | null;
  onStartPause: () => void;
  onReset: () => void;
  onSelectPreset: (presetId: string) => void;
  onCreatePreset: () => void;
  onAdjustFocusMinutes: (delta: number) => void;
  onMasterVolume: (value: number) => void;
  onOpenMixer: () => void;
  onManagePresets: () => void;
  onDismissNotification: () => void;
};

const toClock = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const panelClass =
  "rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]";

export function TimerPage({
  isPlaying,
  masterVolume,
  presets,
  session,
  activePreset,
  savedScenes,
  activeScene,
  onStartPause,
  onReset,
  onSelectPreset,
  onCreatePreset,
  onAdjustFocusMinutes,
  onMasterVolume,
  onOpenMixer,
  onManagePresets,
  onDismissNotification,
}: TimerPageProps) {
  const [presetSidebarCollapsed, setPresetSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (session.isRunning) {
      setPresetSidebarCollapsed(true);
    }
  }, [session.isRunning]);

  const compactMode = Boolean(session.isRunning || activePreset?.distractionFree);

  const activeCycle = useMemo(
    () => (activePreset ? getTimerPresetCycle(activePreset, session.completedCycles) : null),
    [activePreset, session.completedCycles],
  );

  const nextCycle = useMemo(
    () => (activePreset ? getTimerPresetCycle(activePreset, session.completedCycles + 1) : null),
    [activePreset, session.completedCycles],
  );

  const scene = useMemo(
    () => savedScenes.find((entry) => entry.id === (activeCycle?.sceneId ?? activeScene?.id)) ?? activeScene ?? savedScenes[0] ?? null,
    [activeCycle?.sceneId, activeScene, savedScenes],
  );

  const phaseLabel = session.phase === "focus" ? "Focus Session" : "Break";
  const nextUp =
    session.phase === "focus"
      ? `${activeCycle?.breakMinutes ?? activePreset?.breakMinutes ?? 5} min break`
      : `${nextCycle?.focusMinutes ?? activePreset?.focusMinutes ?? 25} min focus`;

  const timerSizeClass = compactMode
    ? "h-80 w-80 xl:h-[24rem] xl:w-[24rem]"
    : "h-72 w-72 xl:h-[21rem] xl:w-[21rem]";

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[var(--text)]">
      <div className={`grid h-full gap-3 ${compactMode || presetSidebarCollapsed ? "grid-cols-1" : "grid-cols-[minmax(0,1fr)_22rem]"} max-[1200px]:grid-cols-1`}>
        <section className={`${panelClass} flex min-h-0 flex-col overflow-hidden ${compactMode ? "col-span-full" : ""}`}>
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">
                  {session.phase === "focus" ? "FOCUS SESSION" : "BREAK SESSION"}
                </p>
                <h1 className="truncate text-4xl font-semibold leading-none xl:text-5xl">
                  {activePreset?.title ?? "Deep Work"}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!compactMode ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
                    onClick={() => setPresetSidebarCollapsed((prev) => !prev)}
                    aria-label={presetSidebarCollapsed ? "Show preset sidebar" : "Hide preset sidebar"}
                  >
                    {presetSidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                    {presetSidebarCollapsed ? "Show Presets" : "Hide Presets"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
                  onClick={onManagePresets}
                >
                  <Layers3Icon /> Manage Presets
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
                  onClick={onOpenMixer}
                >
                  Open Mixer
                </button>
              </div>
            </div>

            {session.notification ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
                  <Bell size={14} />
                  <span>{session.notification}</span>
                </div>
                <button type="button" className="text-sm text-[var(--accent-text)]" onClick={onDismissNotification}>
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>

          <div className={`flex min-h-0 flex-1 flex-col ${compactMode ? "items-center justify-center px-5 py-6 text-center" : "px-5 py-6"}`}>
            <div className={`flex w-full flex-1 flex-col items-center justify-center ${compactMode ? "max-w-4xl" : "max-w-5xl"} mx-auto`}>
              <div
                className={`${timerSizeClass} flex flex-col items-center justify-center rounded-full border-2 border-[var(--accent-border)] [background:var(--dial-bg)] text-center [box-shadow:var(--dial-shadow)]`}
              >
                <strong className="text-6xl leading-none xl:text-7xl">{toClock(session.remainingSeconds)}</strong>
                <span className="mt-3 text-lg text-[var(--text-muted)]">{phaseLabel}</span>
                <span className="mt-1 text-sm text-[var(--text-dim)]">
                  Cycle {session.completedCycles + 1}
                  {activePreset ? ` of ${activePreset.cycles.length}` : ""}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--control)] text-[var(--text-muted)]"
                  aria-label="Reduce focus duration"
                  onClick={() => onAdjustFocusMinutes(-5)}
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  className="inline-flex h-[66px] w-[66px] items-center justify-center rounded-full border border-[var(--accent-border)] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-deep)] text-[var(--text)]"
                  onClick={onStartPause}
                >
                  {session.isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--control)] text-[var(--text-muted)]"
                  aria-label="Increase focus duration"
                  onClick={() => onAdjustFocusMinutes(5)}
                >
                  {">"}
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--control)] px-4 text-[var(--text-soft)]"
                  onClick={onReset}
                >
                  <RotateCcw size={15} /> Reset
                </button>
              </div>

              <div className={`mt-6 grid w-full gap-3 ${compactMode ? "max-w-4xl" : "xl:grid-cols-2"}`}>
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--icon-chip)] text-[var(--text-soft)]">
                      <Headphones size={14} />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">Current Atmosphere</h3>
                      <p className="text-sm text-[var(--text-muted)]">{scene?.title ?? "No ambient scene"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-[var(--text-muted)]">
                    <span>{isPlaying ? "Ambient playing" : "Ambient paused"}</span>
                    <span className="h-3 w-px bg-[var(--border)]" />
                    <span>{activeCycle ? `${activeCycle.focusMinutes} / ${activeCycle.breakMinutes} min cycle` : "Default cycle"}</span>
                    <span className="h-3 w-px bg-[var(--border)]" />
                    <span>{nextUp}</span>
                  </div>
                </div>

                {!compactMode ? (
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Master Volume</h3>
                        <p className="text-sm text-[var(--text-muted)]">Control the overall output.</p>
                      </div>
                      <span className="text-lg font-semibold text-[var(--text-soft)]">{Math.round(masterVolume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Volume2 size={16} className="text-[var(--text-dim)]" />
                      <input
                        type="range"
                        value={masterVolume}
                        onChange={(event) => onMasterVolume(Number(event.currentTarget.value))}
                        min={0}
                        max={1}
                        step={0.01}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--accent-track)] accent-[var(--accent)]"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {!compactMode && !presetSidebarCollapsed ? (
          <aside className={`${panelClass} flex min-h-0 flex-col overflow-hidden`}>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-3 py-3">
              <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">PRESET SIDEBAR</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
                onClick={() => setPresetSidebarCollapsed(true)}
              >
                <PanelRightClose size={16} /> Collapse
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-3">
              <div className="space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                      activePreset?.id === preset.id
                        ? "border-[var(--accent-border)] bg-[var(--accent-soft)]"
                        : "border-[var(--border-subtle)] bg-[var(--surface-muted)] hover:border-[var(--border)] hover:bg-[var(--control-hover)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold">{preset.title}</h4>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{preset.desc}</p>
                      </div>
                      <Layers3Icon />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-2 py-1">
                        {preset.cycles.length} cycles
                      </span>
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-2 py-1">
                        {preset.focusMinutes}/{preset.breakMinutes}
                      </span>
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-2 py-1">
                        {preset.distractionFree ? "Focused" : "Standard"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
                onClick={onManagePresets}
              >
                Manage Presets
              </button>
              <button
                type="button"
                className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
                onClick={() => onCreatePreset()}
              >
                + New Preset
              </button>
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function Layers3Icon() {
  return <Layers3 size={16} className="shrink-0 text-[var(--text-muted)]" />;
}
