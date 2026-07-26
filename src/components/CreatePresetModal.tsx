import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { SavedScene } from "../lib/types";

type CreatePresetPayload = {
  title: string;
  desc: string;
  focusMinutes: number;
  breakMinutes: number;
  sceneId: string;
  cycleCount: number;
};

type CreatePresetModalProps = {
  scenes: SavedScene[];
  defaultSceneId?: string;
  onCancel: () => void;
  onCreate: (payload: CreatePresetPayload) => void;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--border-strong)]";
const labelClass = "block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3";
const captionClass = "mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function CreatePresetModal({
  scenes,
  defaultSceneId,
  onCancel,
  onCreate,
}: CreatePresetModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [focusMinutes, setFocusMinutes] = useState(40);
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [cycleCount, setCycleCount] = useState(4);
  const [sceneId, setSceneId] = useState(defaultSceneId ?? scenes[0]?.id ?? "");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const trimmedTitle = title.trim();

  const handleCreate = () => {
    if (!trimmedTitle) {
      return;
    }
    onCreate({
      title: trimmedTitle,
      desc: desc.trim() || "Personal focus flow preset.",
      focusMinutes: clamp(focusMinutes || 40, 5, 180),
      breakMinutes: clamp(breakMinutes || 10, 1, 60),
      sceneId,
      cycleCount: clamp(cycleCount || 1, 1, 12),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">NEW PRESET</p>
            <h2 className="text-3xl font-semibold leading-none text-[var(--text)]">Create Preset</h2>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--control)] text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
            onClick={onCancel}
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <label className={labelClass}>
            <span className={captionClass}>PRESET NAME</span>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreate();
                }
              }}
              placeholder="e.g. Morning Sprint"
              className={`${inputClass} text-lg`}
            />
          </label>

          <label className={`${labelClass} mt-3`}>
            <span className={captionClass}>DESCRIPTION (OPTIONAL)</span>
            <textarea
              value={desc}
              onChange={(event) => setDesc(event.currentTarget.value)}
              rows={2}
              placeholder="Personal focus flow preset."
              className={`${inputClass} text-sm`}
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className={labelClass}>
              <span className={captionClass}>FOCUS MINUTES</span>
              <input
                type="number"
                min={5}
                max={180}
                value={focusMinutes}
                onChange={(event) => setFocusMinutes(Number(event.currentTarget.value))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              <span className={captionClass}>BREAK MINUTES</span>
              <input
                type="number"
                min={1}
                max={60}
                value={breakMinutes}
                onChange={(event) => setBreakMinutes(Number(event.currentTarget.value))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              <span className={captionClass}>CYCLES</span>
              <input
                type="number"
                min={1}
                max={12}
                value={cycleCount}
                onChange={(event) => setCycleCount(Number(event.currentTarget.value))}
                className={inputClass}
              />
            </label>
          </div>

          <label className={`${labelClass} mt-3`}>
            <span className={captionClass}>SCENE</span>
            <select
              value={sceneId}
              onChange={(event) => setSceneId(event.currentTarget.value)}
              className={inputClass}
            >
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.title}
                </option>
              ))}
            </select>
          </label>

          <p className="mt-3 px-1 text-sm text-[var(--text-muted)]">
            Every cycle starts from these timings and this scene. You can fine-tune individual
            cycles afterwards from the preset editor.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!trimmedTitle}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent-border)] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-strong)] px-4 py-2 text-sm text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleCreate}
          >
            Create Preset
          </button>
        </div>
      </div>
    </div>
  );
}
