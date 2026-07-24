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
  "w-full rounded-xl border border-[#6a94c538] bg-[#091b31e8] px-3 py-2 text-[#f0f5fc] outline-none focus:border-[#6a94c580]";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020b14cc] px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#6a94c526] px-4 py-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">NEW SCENE</p>
            <h2 className="text-3xl font-semibold leading-none text-[#f0f5fc]">Create Scene</h2>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#6a94c552] bg-[#102b488f] text-[#dbe9f8] transition-colors hover:border-[#6a94c599] hover:bg-[#19406bc2]"
            onClick={onCancel}
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <label className="block rounded-2xl border border-[#6a94c538] bg-[#0d243d99] p-3">
            <span className="mb-2 block text-xs tracking-[0.12em] text-[#8ca4c0]">SCENE NAME</span>
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

          <label className="mt-3 block rounded-2xl border border-[#6a94c538] bg-[#0d243d99] p-3">
            <span className="mb-2 block text-xs tracking-[0.12em] text-[#8ca4c0]">DESCRIPTION (OPTIONAL)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              rows={2}
              placeholder={`A custom mix set against ${backdrop?.title ?? "your chosen scene"}.`}
              className={`${inputClass} text-sm`}
            />
          </label>

          <div className="mt-4">
            <p className="mb-2 text-xs tracking-[0.12em] text-[#8ca4c0]">CHOOSE A BACKDROP</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setBackdropId(scene.id)}
                  className={`group relative overflow-hidden rounded-xl border transition ${
                    scene.id === backdropId
                      ? "border-[#5f9bec]"
                      : "border-[#6a94c533] hover:border-[#6a94c580]"
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
                    <span className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2f89ff] text-white">
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

        <div className="flex items-center justify-between gap-3 border-t border-[#6a94c526] bg-[#08192bf2] px-4 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8] transition-colors hover:border-[#6a94c599] hover:bg-[#19406bc2]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!trimmedTitle}
            className="inline-flex items-center gap-2 rounded-xl border border-[#5f9beb] bg-gradient-to-b from-[#2f89ff] to-[#246fd6] px-4 py-2 text-sm text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleCreate}
          >
            Create Scene
          </button>
        </div>
      </div>
    </div>
  );
}
