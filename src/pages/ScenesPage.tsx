import {
  CircleEllipsis,
  Clock3,
  Grid2X2,
  Heart,
  List,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SCENES, SceneItem } from "../lib/scenes";

type ViewMode = "list" | "grid";
type FilterMode = "all" | "favorites" | "short" | "long";

interface ScenesPageProps {
  onPlayScene: (scene: SceneItem) => void;
}

export function ScenesPage({ onPlayScene }: ScenesPageProps) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [scenes, setScenes] = useState<SceneItem[]>(SCENES);
  const [selectedSceneId, setSelectedSceneId] = useState(SCENES[0].id);

  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId) ?? scenes[0];

  const filteredScenes = useMemo(() => {
    return scenes.filter((scene) => {
      const text = `${scene.title} ${scene.description} ${scene.tags.join(" ")}`.toLowerCase();
      const matchesQuery = text.includes(query.trim().toLowerCase());
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "favorites" && scene.favorited) ||
        (filterMode === "short" && scene.duration <= 30) ||
        (filterMode === "long" && scene.duration >= 60);
      return matchesQuery && matchesFilter;
    });
  }, [scenes, query, filterMode]);

  const hero = selectedScene;

  const toggleFavorite = (sceneId: string) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === sceneId ? { ...scene, favorited: !scene.favorited } : scene,
      ),
    );
  };

  const duplicateScene = (source: SceneItem) => {
    setScenes((current) => {
      const nextIndex = current.length;
      const duplicate: SceneItem = {
        ...source,
        id: `scene-${nextIndex}`,
        title: `${source.title} Copy`,
        active: false,
      };
      return [...current, duplicate];
    });
  };

  const exportScene = (scene: SceneItem) => {
    const payload = JSON.stringify(scene, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scene.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-5xl font-semibold leading-none">Scenes</h1>
          <p className="mt-2 text-base text-[#91a7bf]">Curated ambient mixes to help you focus, relax, and sleep.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex w-72 items-center gap-2 rounded-xl border border-[#6a94c547] bg-[#0e253f95] px-3 py-2">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search scenes..."
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              className="w-full bg-transparent text-sm text-[#dce8f6] outline-none placeholder:text-[#91a7bf]"
            />
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8]"
            onClick={() =>
              setFilterMode((prev) =>
                prev === "all" ? "favorites" : prev === "favorites" ? "short" : prev === "short" ? "long" : "all",
              )
            }
          >
            <SlidersHorizontal size={15} /> Filters
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-2 text-sm text-[#dbe9f8]"
            onClick={() => {
              setFilterMode("all");
              setQuery("");
            }}
          >
            All Scenes
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#5f9beb] bg-gradient-to-b from-[#2f89ff] to-[#246fd6] px-3 py-2 text-sm text-white"
            onClick={() => duplicateScene(hero)}
          >
            <Plus size={16} /> Create Scene
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100%-96px)] min-h-0 grid-cols-[minmax(0,1fr)_20rem] gap-3 max-[1400px]:grid-cols-1">
        <section className="flex min-h-0 flex-col gap-3">
          <article className="overflow-hidden rounded-2xl border border-[#6a94c538] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)] min-[901px]:h-[390px]">
            <div className="grid h-full min-h-[176px] grid-cols-[42%_1fr] max-[900px]:grid-cols-1">
              <img src={hero.thumbnail} alt={hero.title} className="h-full min-h-[176px] w-full object-cover" loading="eager" decoding="async" />
              <div className="flex justify-between gap-3 p-4">
                <div>
                  <span className="inline-flex rounded-md border border-[#508bd999] bg-[#2c80e238] px-2 py-0.5 text-[11px] uppercase tracking-[0.05em] text-[#84b8ff]">
                    Active
                  </span>
                  <h2 className="mt-2 text-4xl font-semibold leading-[0.95] max-[1200px]:text-3xl">{hero.title}</h2>
                  <p className="mt-2 text-base text-[#91a7bf]">{hero.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {hero.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-3 py-1 text-xs text-[#9fb4ca]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm text-[#91a7bf]">
                    <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {hero.duration} min</span>
                    <span className="h-3.5 w-px bg-[#78a5db3d]" />
                    <span className="inline-flex items-center gap-1 text-[#4d9cff]">
                      <Heart size={14} fill={hero.favorited ? "currentColor" : "none"} />
                      {hero.favorited ? "Favorited" : "Not Favorite"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onPlayScene(hero)}
                  className="inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-[#6a94c55c] bg-[#112c4ac2] text-[#f0f7ff]"
                  type="button"
                  aria-label="Play scene"
                >
                  <Play size={24} fill="currentColor" />
                </button>
              </div>
            </div>
          </article>

          <article className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#6a94c538] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] p-2 shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]">
            <div className="flex items-center justify-between border-b border-[#6a94c533] px-2 pb-2">
              <h3 className="text-3xl font-semibold">All Scenes</h3>
              <div className="flex gap-2">
                <button className="inline-flex rounded-lg border border-[#6a94c552] bg-[#102b488f] p-2 text-[#dbe9f8]" type="button" aria-label="Grid view" onClick={() => setViewMode("grid")}>
                  <Grid2X2 size={15} />
                </button>
                <button className="inline-flex rounded-lg border border-[#6a94c552] bg-[#102b488f] p-2 text-[#dbe9f8]" type="button" aria-label="List view" onClick={() => setViewMode("list")}>
                  <List size={15} />
                </button>
              </div>
            </div>

            <div className={`mt-2 min-h-0 flex-1 overflow-auto rounded-xl border border-[#6a94c533] ${viewMode === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2 p-2" : ""}`}>
              {filteredScenes.map((scene) => (
                <div
                  key={scene.id}
                  className={viewMode === "grid"
                    ? `cursor-pointer rounded-xl border border-[#6a94c533] bg-[#0d243d99] p-2 ${scene.id === selectedSceneId ? "border-[#5f9bec]" : ""}`
                    : `grid cursor-pointer grid-cols-[104px_minmax(180px,1fr)_80px_minmax(180px,230px)_30px_30px_30px] items-center gap-2 border-b border-[#6a94c526] bg-[#0d243d99] p-2 ${scene.id === selectedSceneId ? "border-l-2 border-l-[#5f9cec] bg-[#2d82ea22]" : ""}`
                  }
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <img src={scene.thumbnail} alt={scene.title} className={viewMode === "grid" ? "h-32 w-full rounded-md object-cover" : "h-14 w-[104px] rounded-md object-cover"} loading="lazy" decoding="async" />
                  <div>
                    <p className="text-sm font-semibold text-[#f0f5fc]">{scene.title}</p>
                  </div>
                  {viewMode === "list" ? <p className="text-sm text-[#91a7bf]">{scene.duration} min</p> : null}
                  <div className="flex flex-wrap gap-1">
                    {scene.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-2 py-0.5 text-[11px] text-[#9fb4ca]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#8ea6bf] hover:bg-[#102b488f]" onClick={(event) => { event.stopPropagation(); toggleFavorite(scene.id); }}>
                    <Heart size={16} fill={scene.favorited ? "currentColor" : "none"} />
                  </button>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#8ea6bf] hover:bg-[#102b488f]" onClick={(event) => { event.stopPropagation(); onPlayScene(scene); }}>
                    <Play size={16} fill="currentColor" />
                  </button>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#8ea6bf] hover:bg-[#102b488f]" onClick={(event) => { event.stopPropagation(); setSelectedSceneId(scene.id); }}>
                    <CircleEllipsis size={16} />
                  </button>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="rounded-2xl border border-[#6a94c538] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] p-3 shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]">
          <h3 className="mb-3 text-4xl font-semibold">Quick Actions</h3>
          <button type="button" className="mb-2 flex w-full items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-3 text-lg text-[#e4eefb]" onClick={() => duplicateScene(hero)}>
            <SquareArrowOutUpRight size={17} /> Duplicate Scene
          </button>
          <button type="button" className="mb-2 flex w-full items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-3 text-lg text-[#e4eefb]" onClick={() => setSelectedSceneId(scenes[0].id)}>
            <Star size={17} /> Set as Default
          </button>
          <button type="button" className="flex w-full items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 py-3 text-lg text-[#e4eefb]" onClick={() => exportScene(hero)}>
            <SquareArrowOutUpRight size={17} /> Export Scene
          </button>
        </aside>
      </div>
    </main>
  );
}
