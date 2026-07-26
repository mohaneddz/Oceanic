import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SCENES } from "../lib/scenes";

type CreateScenePayload = {
  title: string;
  description: string;
  thumbnail: string;
  video: string;
  tags: string[];
};

type CreateSceneModalProps = {
  /** Video path (SavedScene.video) of the scene currently active in the mixer, used only to
   * preselect a sensible starting backdrop. Not a SCENES id - SavedScene ids and the raw
   * SCENES library ids share the same "scene-N" shape but are unrelated namespaces. */
  defaultVideo?: string;
  onCancel: () => void;
  onCreate: (payload: CreateScenePayload) => void;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--border-strong)]";

export function CreateSceneModal({ defaultVideo, onCancel, onCreate }: CreateSceneModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [backdropId, setBackdropId] = useState(
    SCENES.find((scene) => scene.video === defaultVideo)?.id ?? SCENES[0]?.id ?? "",
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const backdrop = SCENES.find((scene) => scene.id === backdropId) ?? SCENES[0];
  const trimmedTitle = title.trim();

  const handleCreate = () => {
    if (!trimmedTitle || !backdrop) {
      return;
    }
    onCreate({
      title: trimmedTitle,
      description: description.trim() || `A custom mix set against ${backdrop.title}.`,
      thumbnail: backdrop.thumbnail,
      video: backdrop.video,
      tags: [...backdrop.tags, "Custom"],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-[var(--text-dim)]">NEW SCENE</p>
            <h2 className="text-3xl font-semibold leading-none text-[var(--text)]">Create Scene</h2>
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
          <label className="block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
            <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">SCENE NAME</span>
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
              placeholder="e.g. Late Night Rain"
              className={`${inputClass} text-lg`}
            />
          </label>

          <label className="mt-3 block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
            <span className="mb-2 block text-xs tracking-[0.12em] text-[var(--text-dim)]">DESCRIPTION (OPTIONAL)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              rows={2}
              placeholder={`A custom mix set against ${backdrop?.title ?? "your chosen scene"}.`}
              className={`${inputClass} text-sm`}
            />
          </label>

          <div className="mt-4">
            <p className="mb-2 text-xs tracking-[0.12em] text-[var(--text-dim)]">CHOOSE A BACKDROP</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setBackdropId(scene.id)}
                  className={`group relative overflow-hidden rounded-xl border transition ${
                    scene.id === backdropId
                      ? "border-[var(--accent-border)]"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                  }`}
                  aria-label={`Use ${scene.title} as backdrop`}
                  aria-pressed={scene.id === backdropId}
                >
                  <img
                    src={scene.thumbnail}
                    alt={scene.title}
                    className="h-16 w-full object-cover sm:h-20"
                    loading="lazy"
                    decoding="async"
                  />
                  {scene.id === backdropId ? (
                    <span className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                      <Check size={12} />
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1 text-left text-[10px] text-white">
                    {scene.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
            Create Scene
          </button>
        </div>
      </div>
    </div>
  );
}
