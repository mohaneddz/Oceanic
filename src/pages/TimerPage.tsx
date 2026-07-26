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
  "rounded-2xl border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]";

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
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <div className={`grid h-full gap-3 ${compactMode || presetSidebarCollapsed ? "grid-cols-1" : "grid-cols-[minmax(0,1fr)_22rem]"} max-[1200px]:grid-cols-1`}>
        <section className={`${panelClass} flex min-h-0 flex-col overflow-hidden ${compactMode ? "col-span-full" : ""}`}>
          <div className="border-b border-[#6695ca33] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">
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
                    className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] hover:border-[#6a94c599] hover:bg-[#19406bc2]"
                    onClick={() => setPresetSidebarCollapsed((prev) => !prev)}
                    aria-label={presetSidebarCollapsed ? "Show preset sidebar" : "Hide preset sidebar"}
                  >
                    {presetSidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
                    {presetSidebarCollapsed ? "Show Presets" : "Hide Presets"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] hover:border-[#6a94c599] hover:bg-[#19406bc2]"
                  onClick={onManagePresets}
                >
                  <Layers3Icon /> Manage Presets
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] hover:border-[#6a94c599] hover:bg-[#19406bc2]"
                  onClick={onOpenMixer}
                >
                  Open Mixer
                </button>
              </div>
            </div>

            {session.notification ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-[#dbe9f8]">
                  <Bell size={14} />
                  <span>{session.notification}</span>
                </div>
                <button type="button" className="text-sm text-[#86beff]" onClick={onDismissNotification}>
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>

          <div className={`flex min-h-0 flex-1 flex-col ${compactMode ? "items-center justify-center px-5 py-6 text-center" : "px-5 py-6"}`}>
            <div className={`flex w-full flex-1 flex-col items-center justify-center ${compactMode ? "max-w-4xl" : "max-w-5xl"} mx-auto`}>
              <div
                className={`${timerSizeClass} flex flex-col items-center justify-center rounded-full border-2 border-[#3a85e3cc] bg-[radial-gradient(circle_at_30%_20%,rgba(36,109,202,0.25),rgba(11,31,53,0.35))] text-center shadow-[inset_0_0_0_10px_rgba(10,31,52,0.7),0_0_26px_rgba(25,108,209,0.24)]`}
              >
                <strong className="text-6xl leading-none xl:text-7xl">{toClock(session.remainingSeconds)}</strong>
                <span className="mt-3 text-lg text-[#91a7bf]">{phaseLabel}</span>
                <span className="mt-1 text-sm text-[#7e9bbb]">
                  Cycle {session.completedCycles + 1}
                  {activePreset ? ` of ${activePreset.cycles.length}` : ""}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6a94c55c] bg-[#0e2742a3] text-[#adc1d8]"
                  aria-label="Reduce focus duration"
                  onClick={() => onAdjustFocusMinutes(-5)}
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  className="inline-flex h-[66px] w-[66px] items-center justify-center rounded-full border border-[#4787d29e] bg-gradient-to-b from-[#2478e0a3] to-[#0f3152f5] text-[#f5f9ff]"
                  onClick={onStartPause}
                >
                  {session.isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6a94c55c] bg-[#0e2742a3] text-[#adc1d8]"
                  aria-label="Increase focus duration"
                  onClick={() => onAdjustFocusMinutes(5)}
                >
                  {">"}
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[#6a94c55c] bg-[#0e2742a3] px-4 text-[#dce8f6]"
                  onClick={onReset}
                >
                  <RotateCcw size={15} /> Reset
                </button>
              </div>

              <div className={`mt-6 grid w-full gap-3 ${compactMode ? "max-w-4xl" : "xl:grid-cols-2"}`}>
                <div className="rounded-2xl border border-[#6a94c538] bg-[#0c233c8c] p-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#78a5db3d] bg-[#133150b3] text-[#c4d6eb]">
                      <Headphones size={14} />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">Current Atmosphere</h3>
                      <p className="text-sm text-[#91a7bf]">{scene?.title ?? "No ambient scene"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-[#9db2c9]">
                    <span>{isPlaying ? "Ambient playing" : "Ambient paused"}</span>
                    <span className="h-3 w-px bg-[#6a94c552]" />
                    <span>{activeCycle ? `${activeCycle.focusMinutes} / ${activeCycle.breakMinutes} min cycle` : "Default cycle"}</span>
                    <span className="h-3 w-px bg-[#6a94c552]" />
                    <span>{nextUp}</span>
                  </div>
                </div>

                {!compactMode ? (
                  <div className="rounded-2xl border border-[#6a94c538] bg-[#0c233c8c] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">Master Volume</h3>
                        <p className="text-sm text-[#91a7bf]">Control the overall output.</p>
                      </div>
                      <span className="text-lg font-semibold text-[#dbe9f8]">{Math.round(masterVolume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Volume2 size={16} className="text-[#8ea6bf]" />
                      <input
                        type="range"
                        value={masterVolume}
                        onChange={(event) => onMasterVolume(Number(event.currentTarget.value))}
                        min={0}
                        max={1}
                        step={0.01}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#2d7de4] accent-[#2f89ff]"
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
            <div className="flex items-center justify-between gap-3 border-b border-[#6a94c526] px-3 py-3">
              <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">PRESET SIDEBAR</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] hover:border-[#6a94c599] hover:bg-[#19406bc2]"
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
                        ? "border-[#5391e0c2] bg-[#2d82ea33]"
                        : "border-[#6a94c538] bg-[#0d243d99] hover:border-[#6a94c552] hover:bg-[#122f4fba]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold">{preset.title}</h4>
                        <p className="mt-1 text-sm text-[#91a7bf]">{preset.desc}</p>
                      </div>
                      <Layers3Icon />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#9fb4ca]">
                      <span className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-2 py-1">
                        {preset.cycles.length} cycles
                      </span>
                      <span className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-2 py-1">
                        {preset.focusMinutes}/{preset.breakMinutes}
                      </span>
                      <span className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-2 py-1">
                        {preset.distractionFree ? "Focused" : "Standard"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] hover:border-[#6a94c599] hover:bg-[#19406bc2]"
                onClick={onManagePresets}
              >
                Manage Presets
              </button>
              <button
                type="button"
                className="mt-2 w-full rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] hover:border-[#6a94c599] hover:bg-[#19406bc2]"
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
  return <Layers3 size={16} className="shrink-0 text-[#9fb4ca]" />;
}
