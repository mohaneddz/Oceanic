import { AlarmClock, Bell, Coffee, Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useMemo } from "react";
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
  onUpdatePreset: (presetId: string, patch: Partial<TimerPreset>) => void;
  onCreatePreset: () => void;
  onAdjustFocusMinutes: (delta: number) => void;
  onChangeScene: (sceneId: string) => void;
  onMasterVolume: (value: number) => void;
  onOpenMixer: () => void;
  onDismissNotification: () => void;
};

const toClock = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

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
  onUpdatePreset,
  onCreatePreset,
  onAdjustFocusMinutes,
  onChangeScene,
  onMasterVolume,
  onOpenMixer,
  onDismissNotification,
}: TimerPageProps) {
  const scene = useMemo(
    () => savedScenes.find((entry) => entry.id === activePreset?.sceneId) ?? activeScene ?? savedScenes[0] ?? null,
    [activePreset?.sceneId, activeScene, savedScenes],
  );

  const distractionFree = activePreset?.distractionFree ?? false;
  const phaseLabel = session.phase === "focus" ? "Focus Session" : "Break";
  const nextUp = session.phase === "focus"
    ? `${activePreset?.breakMinutes ?? 5} min break`
    : `${activePreset?.focusMinutes ?? 25} min focus`;

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <div className={`grid h-full overflow-hidden rounded-2xl border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)] ${
        distractionFree
          ? "grid-cols-[minmax(0,1fr)_0.7fr] max-[1400px]:grid-cols-1"
          : "grid-cols-[1.2fr_0.78fr_0.66fr] max-[1400px]:grid-cols-1"
      } max-[1400px]:h-auto max-[1400px]:overflow-y-auto pr-1`}>
        <section className="overflow-auto border-r border-[#6a94c533] p-4 max-[1400px]:border-b max-[1400px]:border-r-0">
          <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">{session.phase === "focus" ? "FOCUS SESSION" : "BREAK SESSION"}</p>
          <h1 className="text-5xl font-semibold leading-none">{activePreset?.title ?? "Deep Work"}</h1>

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

          <div className="mx-auto my-4 flex h-72 w-72 flex-col items-center justify-center rounded-full border-2 border-[#3a85e3cc] bg-[radial-gradient(circle_at_30%_20%,rgba(36,109,202,0.25),rgba(11,31,53,0.35))] shadow-[inset_0_0_0_10px_rgba(10,31,52,0.7),0_0_26px_rgba(25,108,209,0.24)]">
            <strong className="text-6xl leading-none">{toClock(session.remainingSeconds)}</strong>
            <span className="mt-3 text-lg text-[#91a7bf]">{phaseLabel}</span>
            <span className="mt-1 text-sm text-[#7e9bbb]">{session.completedCycles} completed cycles</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button type="button" className="h-10 w-10 rounded-full border border-[#6a94c55c] bg-[#0e2742a3] text-[#adc1d8]" aria-label="Reduce focus duration" onClick={() => onAdjustFocusMinutes(-5)}>{"<"}</button>
            <button type="button" className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#4787d29e] bg-gradient-to-b from-[#2478e0a3] to-[#0f3152f5] text-[#f5f9ff]" onClick={onStartPause}>
              {session.isRunning ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button type="button" className="h-10 w-10 rounded-full border border-[#6a94c55c] bg-[#0e2742a3] text-[#adc1d8]" aria-label="Increase focus duration" onClick={() => onAdjustFocusMinutes(5)}>{">"}</button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full border border-[#6a94c55c] bg-[#0e2742a3] px-4 text-[#dce8f6]" onClick={onReset}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>

        </section>

        {!distractionFree ? (
          <section className="overflow-auto border-r border-[#6a94c533] p-4 max-[1400px]:border-b max-[1400px]:border-r-0">
            <h2 className="mb-2 text-3xl font-semibold">Session Options</h2>
            {activePreset ? (
              <>
                {[
                  ["fadeOutAtEnd", "Fade out at end", "Sound will fade out gently"],
                  ["breakReminders", "Break reminders", `Every ${activePreset.focusMinutes} min`],
                  ["autoStartNextSession", "Auto-start next session", "Start the next phase automatically"],
                  ["distractionFree", "Distraction-free mode", "Reduce secondary UI on the timer page"],
                ].map(([key, label, sub]) => (
                  <div key={String(key)} className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#6a94c538] bg-[#0c233c8f] p-3">
                    <div>
                      <p className="text-base">{label}</p>
                      <p className="text-sm text-[#91a7bf]">{sub}</p>
                    </div>
                    <button
                      type="button"
                      className={`relative h-5 w-10 rounded-full border ${activePreset[key as keyof TimerPreset] ? "border-[#5d99e9d9] bg-gradient-to-b from-[#2a87ff] to-[#246fd6]" : "border-[#6c9dd647] bg-[#7b96b45c]"}`}
                      onClick={() =>
                        onUpdatePreset(activePreset.id, {
                          [key]: !activePreset[key as keyof TimerPreset],
                        } as Partial<TimerPreset>)
                      }
                    >
                      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#e8f1ff] transition-transform ${activePreset[key as keyof TimerPreset] ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                ))}
              </>
            ) : null}

            <h3 className="mb-2 mt-4 text-2xl font-semibold">POMODORO PRESETS</h3>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`mt-1 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${
                  activePreset?.id === preset.id
                    ? "border-[#5695e4c2] bg-[#2d82ea33] text-white"
                    : "border-[#6a94c552] bg-[#102b488f] text-[#dbe9f8]"
                }`}
              >
                <AlarmClock size={14} /> {preset.title} {preset.focusMinutes} min focus - {preset.breakMinutes} min break
              </button>
            ))}

            <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <Volume2 size={16} className="text-[#8ea6bf]" />
              <input type="range" value={masterVolume} onChange={(event) => onMasterVolume(Number(event.currentTarget.value))} min={0} max={1} step={0.01} className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#2d7de4] accent-[#2f89ff]" />
              <span className="text-sm text-[#9db2c9]">{Math.round(masterVolume * 100)}%</span>
            </div>

            <button type="button" className="mt-3 w-full rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8]" onClick={onOpenMixer}>
              Open Mixer
            </button>
          </section>
        ) : null}

        <aside className="overflow-auto p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Focus Presets</h2>
            <button type="button" className="text-sm text-[#4d9cff]" onClick={() => activePreset && onSelectPreset(activePreset.id)}>Manage</button>
          </div>

          {presets.map((preset) => (
            <button key={preset.id} type="button" className={`mb-2 w-full rounded-xl border p-3 text-left ${activePreset?.id === preset.id ? "border-[#5391e0c2] bg-[#2d82ea33]" : "border-[#6a94c538] bg-[#0d243d99]"}`} onClick={() => onSelectPreset(preset.id)}>
              <div className="mb-1 flex items-center justify-between">
                <h4 className="text-lg font-semibold">{preset.title}</h4>
                <span className="text-xs uppercase tracking-[0.1em] text-[#8ea6bf]">{preset.focusMinutes}/{preset.breakMinutes}</span>
              </div>
              <p className="text-sm text-[#91a7bf]">{preset.desc}</p>
              <p className="mt-1 text-sm text-[#91a7bf]">
                {preset.focusMinutes} min focus - {preset.breakMinutes} min break
              </p>
            </button>
          ))}

          <button
            type="button"
            className="mb-2 w-full rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8]"
            onClick={onCreatePreset}
          >
            + New Preset
          </button>

          <div className="rounded-xl border border-[#6a94c538] bg-[#0d243d99] p-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#78a5db3d] bg-[#133150b3] text-[#c4d6eb]">
                <Coffee size={14} />
              </span>
              <div>
                <h4 className="text-lg font-semibold">Next Up</h4>
                <p className="text-sm text-[#d8e5f3]">{nextUp}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-[#91a7bf]">
              {session.phase === "focus"
                ? "Keep the current block clean. We will handle the next phase for you."
                : "Take a short break, breathe, and recharge before the next focus block."}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-[#9db2c9]">
              <Headphones size={14} />
              <span>{scene?.title ?? "No ambient scene"}</span>
              <span className="h-3 w-px bg-[#6a94c552]" />
              <span>{isPlaying ? "Ambient playing" : "Ambient paused"}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
