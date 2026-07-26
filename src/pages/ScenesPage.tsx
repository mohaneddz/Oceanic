import {
  Clock3,
  Download,
  Grid2X2,
  Heart,
  List,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SavedScene } from "../lib/types";

type ViewMode = "list" | "grid";
type FilterMode = "all" | "favorites" | "short" | "long";

interface ScenesPageProps {
  scenes: SavedScene[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onPreviewScene: (sceneId: string) => void;
  onToggleFavorite: (sceneId: string) => void;
  onDuplicateScene: (sceneId: string) => string | null;
  onExportScene: (sceneId: string) => boolean;
  onImportScene: (file: File) => Promise<boolean>;
  onDeleteScene: (sceneId: string) => boolean;
  onSetDefaultScene: (sceneId: string) => void;
  onCreateScene: () => void;
}

const FILTER_LABELS: Record<FilterMode, string> = {
  all: "All",
  favorites: "Favorites",
  short: "30 min or less",
  long: "60 min or more",
};

const FILTER_ORDER: FilterMode[] = ["all", "favorites", "short", "long"];

export function ScenesPage({
  scenes,
  selectedSceneId,
  onSelectScene,
  onPreviewScene,
  onToggleFavorite,
  onDuplicateScene,
  onExportScene,
  onImportScene,
  onDeleteScene,
  onSetDefaultScene,
  onCreateScene,
}: ScenesPageProps) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [importError, setImportError] = useState(false);

  const selected = scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0];

  const filteredScenes = useMemo(() => {
    return scenes.filter((scene) => {
      const text = `${scene.title} ${scene.description} ${scene.tags.join(" ")}`.toLowerCase();
      const matchesQuery = text.includes(query.trim().toLowerCase());
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "favorites" && scene.favorite) ||
        (filterMode === "short" && scene.duration <= 30) ||
        (filterMode === "long" && scene.duration >= 60);
      return matchesQuery && matchesFilter;
    });
  }, [scenes, query, filterMode]);

  if (!selected) {
    return null;
  }

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[var(--text)]">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-5xl font-semibold leading-none">Scenes</h1>
          <p className="mt-2 text-base text-[var(--text-muted)]">Saved ambient mixes tied to your own sound layers and visuals.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex w-72 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search scenes..."
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              className="w-full bg-transparent text-sm text-[var(--text-soft)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              filterMode === "all"
                ? "border-[var(--border)] bg-[var(--control)] text-[var(--text-soft)] hover:border-[var(--border-strong)]"
                : "border-[var(--accent-border)] bg-[var(--accent-fill)] text-white"
            }`}
            onClick={() =>
              setFilterMode(
                (prev) => FILTER_ORDER[(FILTER_ORDER.indexOf(prev) + 1) % FILTER_ORDER.length],
              )
            }
            title="Cycle scene filters"
          >
            <SlidersHorizontal size={15} /> {FILTER_LABELS[filterMode]}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={filterMode === "all" && !query}
            onClick={() => {
              setFilterMode("all");
              setQuery("");
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent-border)] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-strong)] px-3 py-2 text-sm text-white"
            onClick={onCreateScene}
          >
            <Plus size={16} /> Create Scene
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100%-96px)] min-h-0 grid-cols-[minmax(0,1fr)_20rem] gap-3 max-[1400px]:grid-cols-1 max-[1400px]:h-auto max-[1400px]:overflow-y-auto pr-1">
        <section className="flex min-h-0 flex-col gap-3">
          <article className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)] min-[901px]:h-[390px]">
            <div className="grid h-full min-h-[176px] grid-cols-[42%_1fr] max-[900px]:grid-cols-1">
              <img src={selected.thumbnail} alt={selected.title} className="h-full min-h-[176px] w-full object-cover" loading="eager" decoding="async" />
              <div className="flex justify-between gap-3 p-4">
                <div>
                  <span className="inline-flex rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] uppercase tracking-[0.05em] text-[var(--accent-text)]">
                    {selected.isDefault ? "Default" : "Saved"}
                  </span>
                  <h2 className="mt-2 text-4xl font-semibold leading-[0.95] max-[1200px]:text-3xl">{selected.title}</h2>
                  <p className="mt-2 text-base text-[var(--text-muted)]">{selected.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-3 py-1 text-xs text-[var(--text-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {selected.duration} min</span>
                    <span className="h-3.5 w-px bg-[var(--border)]" />
                    <span className="inline-flex items-center gap-1 text-[var(--accent-text)]">
                      <Heart size={14} fill={selected.favorite ? "currentColor" : "none"} />
                      {selected.favorite ? "Favorited" : "Not Favorite"}
                    </span>
                    <span className="h-3.5 w-px bg-[var(--border)]" />
                    <span>{selected.soundIds.length} sounds</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onPreviewScene(selected.id)}
                    className="inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--control)] text-[var(--text)] hover:bg-[var(--control-hover)] hover:scale-105 transition-all"
                    type="button"
                    aria-label="Play and preview scene"
                  >
                    <Play size={24} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] p-2 shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-2 pb-2">
              <h3 className="text-3xl font-semibold">All Scenes</h3>
              <div className="flex gap-2">
                <button className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--control)] p-2 text-[var(--text-soft)]" type="button" aria-label="Grid view" onClick={() => setViewMode("grid")}>
                  <Grid2X2 size={15} />
                </button>
                <button className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--control)] p-2 text-[var(--text-soft)]" type="button" aria-label="List view" onClick={() => setViewMode("list")}>
                  <List size={15} />
                </button>
              </div>
            </div>

            {!filteredScenes.length ? (
              <div className="mt-2 flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-subtle)] p-6 text-center">
                <p className="text-lg text-[var(--text-soft)]">No scenes match this view.</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {query
                    ? `Nothing found for "${query}".`
                    : `No scenes are tagged "${FILTER_LABELS[filterMode]}".`}
                </p>
                <button
                  type="button"
                  className="mt-1 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--control-hover)]"
                  onClick={() => {
                    setFilterMode("all");
                    setQuery("");
                  }}
                >
                  Show all scenes
                </button>
              </div>
            ) : (
            <div className={`mt-2 min-h-0 flex-1 overflow-auto rounded-xl border border-[var(--border-subtle)] ${viewMode === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2 p-2" : ""}`}>
              {filteredScenes.map((scene) => (
                <div
                  key={scene.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={scene.id === selected.id}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectScene(scene.id);
                    }
                  }}
                  className={viewMode === "grid"
                    ? `cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2 ${scene.id === selected.id ? "border-[var(--accent-border)]" : ""}`
                    : `grid cursor-pointer grid-cols-[104px_minmax(180px,1fr)_80px_minmax(180px,230px)_30px_30px] items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2 ${scene.id === selected.id ? "border-l-2 border-l-[var(--accent-border)] bg-[var(--accent-soft)]" : ""}`
                  }
                  onClick={() => onSelectScene(scene.id)}
                >
                  <img src={scene.thumbnail} alt={scene.title} className={viewMode === "grid" ? "h-32 w-full rounded-md object-cover" : "h-14 w-[104px] rounded-md object-cover"} loading="lazy" decoding="async" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{scene.title}</p>
                  </div>
                  {viewMode === "list" ? <p className="text-sm text-[var(--text-muted)]">{scene.duration} min</p> : null}
                  <div className="flex flex-wrap gap-1">
                    {scene.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--border-subtle)] bg-[var(--pill)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-dim)] hover:bg-[var(--control)]" onClick={(event) => { event.stopPropagation(); onToggleFavorite(scene.id); }}>
                    <Heart size={16} fill={scene.favorite ? "currentColor" : "none"} />
                  </button>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-dim)] hover:bg-[var(--control)]" onClick={(event) => { event.stopPropagation(); onPreviewScene(scene.id); }}>
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
            )}
          </article>
        </section>

        <aside className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] p-3 shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]">
          <h3 className="mb-3 text-4xl font-semibold">Quick Actions</h3>
          <button type="button" className="mb-2 flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-3 text-lg text-[var(--text-soft)]" onClick={() => {
            const duplicatedId = onDuplicateScene(selected.id);
            if (duplicatedId) {
              onSelectScene(duplicatedId);
            }
          }}>
            <SquareArrowOutUpRight size={17} /> Duplicate Scene
          </button>
          <button type="button" className="mb-2 flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-3 text-lg text-[var(--text-soft)]" onClick={() => onSetDefaultScene(selected.id)}>
            <Star size={17} /> Set as Default
          </button>
          <button type="button" className="mb-2 flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-3 text-lg text-[var(--text-soft)]" onClick={() => onExportScene(selected.id)}>
            <Upload size={17} /> Export Scene
          </button>
          <label className="mb-2 flex w-full cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-3 text-lg text-[var(--text-soft)] transition-colors hover:bg-[var(--control-hover)]">
            <Download size={17} /> Import Scene
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                setImportError(!(await onImportScene(file)));
              }}
            />
          </label>
          {importError ? (
            <p className="mb-2 px-1 text-sm text-[var(--danger-text)]">
              That file isn&apos;t a valid Oceanic scene export.
            </p>
          ) : null}
          <button type="button" className="mb-2 flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--control)] px-3 py-3 text-lg text-[var(--text-soft)] hover:bg-[var(--control-hover)] transition-colors" onClick={() => onPreviewScene(selected.id)}>
            <Play size={17} /> Play Scene
          </button>

          {pendingDeleteId === selected.id ? (
            <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3">
              <p className="text-sm text-[var(--danger-text)]">
                Delete &ldquo;{selected.title}&rdquo;? This cannot be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-solid)] px-3 py-2 text-sm text-white transition-colors hover:bg-[var(--danger-solid-hover)]"
                  onClick={() => {
                    onDeleteScene(selected.id);
                    setPendingDeleteId(null);
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--control)] px-3 py-2 text-sm text-[var(--text-soft)] transition-colors hover:border-[var(--border-strong)]"
                  onClick={() => setPendingDeleteId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={scenes.length <= 1}
              title={scenes.length <= 1 ? "Keep at least one scene" : undefined}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-3 text-lg text-[var(--danger-text)] transition-colors hover:border-[var(--danger-border-strong)] hover:bg-[var(--danger-bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setPendingDeleteId(selected.id)}
            >
              <Trash2 size={17} /> Delete Scene
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}
