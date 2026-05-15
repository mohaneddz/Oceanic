import { AlarmClock, CircleEllipsis, Coffee, Headphones, Pause, Play, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

import { SCENES } from "../lib/scenes";

type FocusPreset = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  scene: string;
  active: boolean;
};

export function TimerPage() {
  const [minutes, setMinutes] = useState(50);
  const [isPaused, setIsPaused] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [optionState, setOptionState] = useState<Record<string, boolean>>({
    "Fade out at end": true,
    "Break reminders": false,
    "Auto-start next session": true,
    "Distraction-free mode": true,
  });
  const [focusPresets, setFocusPresets] = useState<FocusPreset[]>([
    { id: "p1", title: "Deep Work", desc: "Stay in the zone and get important work done.", duration: "50 min", scene: "Oceanic Blanket", active: true },
    { id: "p2", title: "Reading", desc: "Enhance concentration and comprehension while reading.", duration: "35 min", scene: "Rainy Day", active: false },
    { id: "p3", title: "Meditation", desc: "Clear your mind and cultivate calm presence.", duration: "20 min", scene: "Morning Calm", active: false },
    { id: "p4", title: "Writing", desc: "Find your flow and bring your ideas to life.", duration: "45 min", scene: "Night Escape", active: false },
  ]);

  const scene = useMemo(() => SCENES[sceneIndex] ?? SCENES[0], [sceneIndex]);

  const selectPreset = (presetId: string) => {
    setFocusPresets((current) =>
      current.map((preset) => ({ ...preset, active: preset.id === presetId })),
    );
  };

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <div className="grid h-full grid-cols-[1.2fr_0.78fr_0.66fr] overflow-hidden rounded-2xl border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)] max-[1400px]:grid-cols-1">
        <section className="overflow-auto border-r border-[#6a94c533] p-4 max-[1400px]:border-b max-[1400px]:border-r-0">
          <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">FOCUS SESSION</p>
          <h1 className="text-5xl font-semibold leading-none">Deep Work</h1>

          <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-[#6a94c540] bg-[#0e253f95] p-1.5">
            <span className="rounded-full border border-[#5891dd94] bg-gradient-to-b from-[#2773d4a3] to-[#1a426fc2] px-3 py-1 text-sm">Goal</span>
            <span className="pr-2 text-base text-[#d6e1f0]">Finish project proposal</span>
          </div>

          <div className="mx-auto my-4 flex h-64 w-64 flex-col items-center justify-center rounded-full border-2 border-[#3a85e3cc] bg-[radial-gradient(circle_at_30%_20%,rgba(36,109,202,0.25),rgba(11,31,53,0.35))] shadow-[inset_0_0_0_10px_rgba(10,31,52,0.7),0_0_26px_rgba(25,108,209,0.24)]">
            <strong className="text-6xl leading-none">{minutes}</strong>
            <span className="text-4xl leading-none">min</span>
            <span className="mt-2 text-lg text-[#91a7bf]">Focus Session</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button type="button" className="h-10 w-10 rounded-full border border-[#6a94c55c] bg-[#0e2742a3] text-[#adc1d8]" aria-label="Previous session" onClick={() => setMinutes((current) => Math.max(10, current - 5))}>{"<"}</button>
            <button type="button" className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#4787d29e] bg-gradient-to-b from-[#2478e0a3] to-[#0f3152f5] text-[#f5f9ff]" onClick={() => setIsPaused((current) => !current)}>
              {isPaused ? <Play size={22} /> : <Pause size={22} />}
            </button>
            <button type="button" className="h-10 w-10 rounded-full border border-[#6a94c55c] bg-[#0e2742a3] text-[#adc1d8]" aria-label="Next session" onClick={() => setMinutes((current) => Math.min(120, current + 5))}>{">"}</button>
          </div>

          <div className="mt-3 rounded-xl border border-[#6a94c538] bg-[#0c233c8f] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">AMBIENT SCENE</p>
                <h3 className="text-2xl font-semibold">{scene.title}</h3>
              </div>
              <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8]" onClick={() => setSceneIndex((current) => (current + 1) % SCENES.length)}>
                <Headphones size={14} /> Change Scene
              </button>
            </div>
            <img src={scene.thumbnail} alt={scene.title} className="mb-3 h-40 w-full rounded-lg border border-[#6a94c533] object-cover" loading="lazy" decoding="async" />
            <p className="text-sm text-[#91a7bf]">{scene.description}</p>
          </div>
        </section>

        <section className="overflow-auto border-r border-[#6a94c533] p-4 max-[1400px]:border-b max-[1400px]:border-r-0">
          <h2 className="mb-2 text-3xl font-semibold">Session Options</h2>
          {[
            ["Fade out at end", "Sound will fade out gently"],
            ["Break reminders", "Every 50 min"],
            ["Auto-start next session", "Start a break after focus session"],
            ["Distraction-free mode", "Hide notifications and alerts"],
          ].map(([label, sub]) => (
            <div key={String(label)} className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[#6a94c538] bg-[#0c233c8f] p-3">
              <div>
                <p className="text-base">{label}</p>
                <p className="text-sm text-[#91a7bf]">{sub}</p>
              </div>
              <button
                type="button"
                className={`relative h-5 w-10 rounded-full border ${optionState[label] ? "border-[#5d99e9d9] bg-gradient-to-b from-[#2a87ff] to-[#246fd6]" : "border-[#6c9dd647] bg-[#7b96b45c]"}`}
                onClick={() =>
                  setOptionState((current) => ({
                    ...current,
                    [label]: !current[label],
                  }))
                }
              >
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#e8f1ff] transition-transform ${optionState[label] ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}

          <h3 className="mb-2 mt-4 text-2xl font-semibold">POMODORO PRESETS</h3>
          {[
            "Pomodoro 25 min focus - 5 min break",
            "Deep Focus 50 min focus - 10 min break",
            "Extended 90 min focus - 15 min break",
            "Custom Create your own session",
          ].map((label, idx) => (
            <button key={label} type="button" className={`mt-1 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${idx === 1 ? "border-[#5695e4c2] bg-[#2d82ea33] text-white" : "border-[#6a94c552] bg-[#102b488f] text-[#dbe9f8]"}`}>
              <AlarmClock size={14} /> {label}
            </button>
          ))}

          <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Volume2 size={16} className="text-[#8ea6bf]" />
            <input type="range" defaultValue={0.7} min={0} max={1} step={0.01} className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#2d7de4] accent-[#2f89ff]" />
            <span className="text-sm text-[#9db2c9]">70%</span>
          </div>

          <button type="button" className="mt-3 w-full rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8]" onClick={() => { window.history.pushState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")); }}>
            Open Mixer
          </button>
        </section>

        <aside className="overflow-auto p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Focus Presets</h2>
            <button type="button" className="text-sm text-[#4d9cff]" onClick={() => selectPreset(focusPresets[0].id)}>Manage</button>
          </div>

          {focusPresets.map((preset) => (
            <button key={preset.id} type="button" className={`mb-2 w-full rounded-xl border p-3 text-left ${preset.active ? "border-[#5391e0c2] bg-[#2d82ea33]" : "border-[#6a94c538] bg-[#0d243d99]"}`} onClick={() => selectPreset(preset.id)}>
              <div className="mb-1 flex items-center justify-between">
                <h4 className="text-lg font-semibold">{preset.title}</h4>
                <CircleEllipsis size={16} className="text-[#8ea6bf]" />
              </div>
              <p className="text-sm text-[#91a7bf]">{preset.desc}</p>
              <p className="mt-1 text-sm text-[#91a7bf]">{preset.duration} - {preset.scene}</p>
            </button>
          ))}

          <button
            type="button"
            className="mb-2 w-full rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8]"
            onClick={() =>
              setFocusPresets((current) => [
                ...current,
                {
                  id: `p${current.length + 1}`,
                  title: `Custom ${current.length + 1}`,
                  desc: "Personal focus flow preset.",
                  duration: "40 min",
                  scene: scene.title,
                  active: false,
                },
              ])
            }
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
                <p className="text-sm text-[#d8e5f3]">10 min break</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-[#91a7bf]">Take a short break, breathe, and recharge.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
