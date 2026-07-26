import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import type { SavedScene, TimerPreset, TimerPresetCycle } from "../lib/types";

type Props = {
  presets: TimerPreset[];
  scenes: SavedScene[];
  activePresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onUpdatePreset: (presetId: string, patch: Partial<TimerPreset>) => void;
  onCreatePreset: () => void;
  onDeletePreset: (presetId: string) => boolean;
  onOpenTimer: () => void;
};

const panelClass =
  "rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]";

function Toggle({
  checked,
  onToggle = () => {},
}: {
  checked: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-5 w-10 rounded-full border transition ${
        checked
          ? "border-[var(--accent-border)] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-strong)]"
          : "border-[var(--border)] bg-[var(--toggle-off)]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[var(--toggle-knob)] transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function clonePreset(preset: TimerPreset): TimerPreset {
  return {
    ...preset,
    cycles: preset.cycles.map((cycle) => ({ ...cycle })),
  };
}

function createCycle(index: number, sceneId: string, baseFocus: number, baseBreak: number): TimerPresetCycle {
  return {
    id: `cycle-${Date.now()}-${index}`,
    label: `Cycle ${index + 1}`,
    focusMinutes: baseFocus,
    breakMinutes: baseBreak,
    sceneId,
  };
}

function PresetSummary({ preset, scenes }: { preset: TimerPreset; scenes: SavedScene[] }) {
  const firstCycle = preset.cycles[0] ?? null;
  const scene = scenes.find((entry) => entry.id === (firstCycle?.sceneId ?? preset.sceneId)) ?? null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-3 py-1">
        {preset.cycles.length} cycles
      </span>
      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-3 py-1">
        {preset.focusMinutes} / {preset.breakMinutes} min
      </span>
      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-3 py-1">
        {scene?.title ?? "No scene selected"}
      </span>
    </div>
  );
}

export function TimerPresetsPage({
  presets,
  scenes,
  activePresetId,
  onSelectPreset,
  onUpdatePreset,
  onCreatePreset,
  onDeletePreset,
  onOpenTimer,
}: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editorPresetId, setEditorPresetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TimerPreset | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === activePresetId) ?? presets[0] ?? null,
    [activePresetId, presets],
  );

  const editorPreset = useMemo(
    () => presets.find((preset) => preset.id === editorPresetId) ?? null,
    [editorPresetId, presets],
  );

  useEffect(() => {
    if (!editorPreset) {
      return;
    }
    setDraft(clonePreset(editorPreset));
  }, [editorPreset]);

  useEffect(() => {
    if (!editorPresetId) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditorPresetId(null);
        setDraft(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorPresetId]);

  const presetRailClass = sidebarCollapsed
    ? "grid-cols-[4.5rem_minmax(0,1fr)]"
    : "grid-cols-[17rem_minmax(0,1fr)]";

  const openEditor = (preset: TimerPreset) => {
    setEditorPresetId(preset.id);
    setDraft(clonePreset(preset));
  };

  const saveDraft = () => {
    if (!draft) {
      return;
    }
    onUpdatePreset(draft.id, draft);
    setEditorPresetId(null);
    setDraft(null);
  };

  const updateDraft = (patch: Partial<TimerPreset>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const updateCycle = (cycleId: string, patch: Partial<TimerPresetCycle>) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        cycles: current.cycles.map((cycle) => (cycle.id === cycleId ? { ...cycle, ...patch } : cycle)),
      };
    });
  };

  const removeCycle = (cycleId: string) => {
    setDraft((current) => {
      if (!current || current.cycles.length <= 1) {
        return current;
      }
      return { ...current, cycles: current.cycles.filter((cycle) => cycle.id !== cycleId) };
    });
  };

  const addCycle = () => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        cycles: [
          ...current.cycles,
          createCycle(
            current.cycles.length,
            current.cycles[current.cycles.length - 1]?.sceneId ?? current.sceneId,
            current.focusMinutes,
            current.breakMinutes,
          ),
        ],
      };
    });
  };

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[var(--text)]">
      <div className={`grid h-full gap-3 ${presetRailClass} max-[1180px]:grid-cols-1`}>
        <aside className={`${panelClass} flex min-h-0 flex-col overflow-hidden`}>
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-3">
            {!sidebarCollapsed ? <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">PRESETS</p> : <span />}
            <button
              type="button"
              className={buttonClass}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? "Expand preset sidebar" : "Collapse preset sidebar"}
              title={sidebarCollapsed ? "Expand" : "Collapse"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-2">
            {sidebarCollapsed ? (
              <div className="flex flex-col gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset.id)}
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${
                      preset.id === activePreset?.id
                        ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-white"
                        : "border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-soft)] hover:border-[var(--border)] hover:bg-[var(--control-hover)]"
                    }`}
                    title={preset.title}
                    aria-label={`Select ${preset.title}`}
                  >
                    {preset.title.slice(0, 2).toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectPreset(preset.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectPreset(preset.id);
                      }
                    }}
                    className={`rounded-2xl border p-3 text-left transition-colors ${
                      preset.id === activePreset?.id
                        ? "border-[var(--accent-border)] bg-[var(--accent-soft)]"
                        : "border-[var(--border-subtle)] bg-[var(--surface-muted)] hover:border-[var(--border)] hover:bg-[var(--control-hover)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{preset.title}</h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{preset.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`${buttonClass} px-2.5 py-1.5`}
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditor(preset);
                          }}
                          aria-label={`Edit ${preset.title}`}
                        >
                          Edit
                        </button>
                        <Layers3 size={16} className="mt-1 shrink-0 text-[var(--text-muted)]" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-2 py-1">
                        {preset.cycles.length} cycles
                      </span>
                      <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-2 py-1">
                        {preset.focusMinutes}/{preset.breakMinutes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] p-3">
            <button type="button" className={`${buttonClass} w-full`} onClick={onCreatePreset}>
              <Plus size={16} /> New Preset
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
              onClick={onOpenTimer}
            >
              Back to Timer
            </button>
          </div>
        </aside>

        <section className="min-h-0 overflow-auto pr-1">
          <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-5xl font-semibold leading-none">Preset Manager</h1>
              <p className="mt-2 max-w-3xl text-base text-[var(--text-muted)]">
                Click a preset card to select it for the timer. Use Edit to change timings, scenes,
                and the cycle schedule.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={buttonClass} onClick={onOpenTimer}>
                <ChevronLeft size={16} /> Back to Timer
              </button>
              <button type="button" className={buttonClass} onClick={onCreatePreset}>
                <Plus size={16} /> Create Preset
              </button>
            </div>
          </header>

          <div className="grid gap-3 min-[1120px]:grid-cols-2 2xl:grid-cols-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectPreset(preset.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectPreset(preset.id);
                  }
                }}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  preset.id === activePreset?.id
                    ? "border-[var(--accent-border)] bg-[var(--accent-deep)] shadow-[0_0.625rem_1.375rem_rgba(4,16,28,0.34)]"
                    : "border-[var(--border-subtle)] bg-[var(--surface-muted)] hover:border-[var(--border)] hover:bg-[var(--control-hover)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Timer size={16} className="text-[var(--text-muted)]" />
                      <h3 className="text-2xl font-semibold">{preset.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{preset.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {preset.id === activePreset?.id ? (
                      <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-[0.7rem] uppercase tracking-[0.08em] text-[var(--accent-text)]">
                        Selected
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditor(preset);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={presets.length <= 1}
                      title={presets.length <= 1 ? "Keep at least one preset" : `Delete ${preset.title}`}
                      aria-label={`Delete ${preset.title}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-2.5 py-2 text-[var(--danger-text)] transition-colors hover:border-[var(--danger-border-strong)] hover:bg-[var(--danger-bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingDeleteId(preset.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <PresetSummary preset={preset} scenes={scenes} />

                {pendingDeleteId === preset.id ? (
                  <div className="mt-4 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3">
                    <p className="text-sm text-[var(--danger-text)]">
                      Delete &ldquo;{preset.title}&rdquo;? This cannot be undone.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-solid)] px-3 py-2 text-sm text-white transition-colors hover:bg-[var(--danger-solid-hover)]"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeletePreset(preset.id);
                          setPendingDeleteId(null);
                        }}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className={`${buttonClass} flex-1`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDeleteId(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={14} /> {preset.focusMinutes}m focus
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ChevronRight size={14} /> {preset.breakMinutes}m break
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {draft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] px-4 py-6 backdrop-blur-sm">
          <div className={`${panelClass} flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden`}>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4">
              <div>
                <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">EDIT PRESET</p>
                <h2 className="text-3xl font-semibold leading-none">{draft.title}</h2>
              </div>
              <button
                type="button"
                className={buttonClass}
                onClick={() => {
                  setEditorPresetId(null);
                  setDraft(null);
                }}
                aria-label="Close editor"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="min-h-0 overflow-y-auto overflow-x-hidden p-4">
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                    <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">TITLE</span>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(event) => updateDraft({ title: event.currentTarget.value })}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-lg text-[var(--text)] outline-none"
                    />
                  </label>

                  <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                    <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">MAIN SCENE</span>
                    <select
                      value={draft.sceneId}
                      onChange={(event) => updateDraft({ sceneId: event.currentTarget.value })}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--text)] outline-none"
                    >
                      {scenes.map((scene) => (
                        <option key={scene.id} value={scene.id}>
                          {scene.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 lg:col-span-2">
                    <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">DESCRIPTION</span>
                    <textarea
                      value={draft.desc}
                      onChange={(event) => updateDraft({ desc: event.currentTarget.value })}
                      rows={3}
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text)] outline-none"
                    />
                  </label>

                  <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                    <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">FOCUS MINUTES</span>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={draft.focusMinutes}
                      onChange={(event) =>
                        updateDraft({ focusMinutes: Number(event.currentTarget.value) || 0 })
                      }
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--text)] outline-none"
                    />
                  </label>

                  <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                    <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">BREAK MINUTES</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={draft.breakMinutes}
                      onChange={(event) =>
                        updateDraft({ breakMinutes: Number(event.currentTarget.value) || 0 })
                      }
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--text)] outline-none"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold">Cycles</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Each cycle can have its own duration and scene.
                      </p>
                    </div>
                    <button type="button" className={buttonClass} onClick={addCycle}>
                      <Plus size={16} /> Add Cycle
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {draft.cycles.map((cycle, index) => (
                      <div
                        key={cycle.id}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-3"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--icon-chip)] text-sm text-[var(--text-soft)]">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={cycle.label}
                              onChange={(event) =>
                                updateCycle(cycle.id, { label: event.currentTarget.value })
                              }
                              className="min-w-[10rem] rounded-xl border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-base text-[var(--text)] outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            className={buttonClass}
                            onClick={() => removeCycle(cycle.id)}
                            disabled={draft.cycles.length <= 1}
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
                          <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-3">
                            <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">
                              FOCUS MINUTES
                            </span>
                            <input
                              type="number"
                              min={5}
                              max={180}
                              value={cycle.focusMinutes}
                              onChange={(event) =>
                                updateCycle(cycle.id, {
                                  focusMinutes: Number(event.currentTarget.value) || 0,
                                })
                              }
                              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--text)] outline-none"
                            />
                          </label>

                          <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-3">
                            <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">
                              BREAK MINUTES
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={60}
                              value={cycle.breakMinutes}
                              onChange={(event) =>
                                updateCycle(cycle.id, {
                                  breakMinutes: Number(event.currentTarget.value) || 0,
                                })
                              }
                              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--text)] outline-none"
                            />
                          </label>

                          <label className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] p-3">
                            <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">
                              CYCLE SCENE
                            </span>
                            <select
                              value={cycle.sceneId}
                              onChange={(event) =>
                                updateCycle(cycle.id, { sceneId: event.currentTarget.value })
                              }
                              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--text)] outline-none"
                            >
                              {scenes.map((scene) => (
                                <option key={scene.id} value={scene.id}>
                                  {scene.title}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {[
                    ["fadeOutAtEnd", "Fade out at end", "Sound will fade out gently"],
                    [
                      "breakReminders",
                      "Break reminders",
                      "Desktop notification when a phase ends, even in the tray",
                    ],
                    ["autoStartNextSession", "Auto-start next session", "Start the next phase automatically"],
                    ["distractionFree", "Distraction-free mode", "Reduce secondary UI on the timer page"],
                  ].map(([key, label, description]) => (
                    <div
                      key={String(key)}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3"
                    >
                      <div>
                        <p className="text-base">{label}</p>
                        <p className="text-sm text-[var(--text-muted)]">{description}</p>
                      </div>
                      <Toggle
                        checked={Boolean(draft[key as keyof TimerPreset])}
                        onToggle={() =>
                          updateDraft({
                            [key]: !draft[key as keyof TimerPreset],
                          } as Partial<TimerPreset>)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <aside className="min-h-0 overflow-y-auto border-t border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 xl:border-l xl:border-t-0">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">LIVE SUMMARY</p>
                  <h3 className="mt-2 text-3xl font-semibold">{draft.title}</h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{draft.desc}</p>
                  <div className="mt-4 grid gap-2 text-sm text-[var(--text-soft)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-muted)]">Cycles</span>
                      <span>{draft.cycles.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-muted)]">Base focus</span>
                      <span>{draft.focusMinutes} min</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-muted)]">Base break</span>
                      <span>{draft.breakMinutes} min</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-muted)]">Session mode</span>
                      <span>{draft.distractionFree ? "Focused" : "Standard"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-muted)]">Auto-start next</span>
                      <span>{draft.autoStartNextSession ? "On" : "Off"}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                    <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">SCENE</p>
                    <p className="mt-2 text-lg font-semibold">
                      {scenes.find((scene) => scene.id === draft.sceneId)?.title ?? "No scene selected"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Cycle scenes can override this base scene.
                    </p>
                  </div>

                  <PresetSummary preset={draft} scenes={scenes} />
                </div>
              </aside>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-4 backdrop-blur-sm">
              <button
                type="button"
                className={buttonClass}
                onClick={() => {
                  setEditorPresetId(null);
                  setDraft(null);
                }}
              >
                <ChevronLeft size={16} /> Cancel
              </button>
              <button type="button" className={`${buttonClass} border-[var(--accent-border)] bg-[var(--accent)] text-white`} onClick={saveDraft}>
                <Save size={16} /> Save Preset
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
