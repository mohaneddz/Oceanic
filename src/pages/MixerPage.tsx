import { Fragment, memo, useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  Bird,
  Bookmark,
  CircleEllipsis,
  CloudLightning,
  CloudRain,
  Coffee,
  Flame,
  Heart,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  Timer,
  TrainFront,
  Waves,
  Wind,
  Fan,
  Plane,
  Trees,
  MoonStar,
  type LucideIcon,
} from "lucide-react";
import { SOUND_GROUPS } from "../lib/sounds";
import type { OceanicSettings, SavedScene, SoundIconName } from "../lib/types";

type Props = {
  isPlaying: boolean;
  settings: OceanicSettings;
  activeCount: number;
  activeScene: SavedScene | null;
  savedScenes: SavedScene[];
  onTogglePlayback: () => void;
  onMasterVolume: (value: number) => void;
  onToggleSound: (soundId: string) => void;
  onSoundVolume: (soundId: string, volume: number) => void;
  onToggleFavorite: (soundId: string) => void;
  onToggleMultipleSounds: (soundIds: string[], enabled: boolean) => void;
  onApplyScene: (sceneId: string) => void;
  onSaveScene: (sceneId: string) => void;
  onCreateScene: () => void;
  onSetDefaultScene: (sceneId: string) => void;
  onManageScenes: () => void;
  onOpenSceneFullscreen: (sceneId: string) => void;
  onOpenFocusSession: () => void;
};

const soundIconMap: Record<SoundIconName, LucideIcon> = {
  rain: CloudRain,
  storm: CloudLightning,
  wind: Wind,
  waves: Waves,
  stream: AudioLines,
  birds: Bird,
  night: MoonStar,
  train: TrainFront,
  boat: Waves,
  city: AudioLines,
  coffee: Coffee,
  fireplace: Flame,
  fan: Fan,
  plane: Plane,
  camp: Flame,
  leaves: Trees,
  noise: AudioLines,
};

const rangeClass =
  "h-1 w-full cursor-pointer appearance-none rounded-full bg-[#2d7de4] accent-[#2f89ff] " +
  "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#4b85d3cc] [&::-webkit-slider-thumb]:bg-[#f4f8ff] [&::-webkit-slider-thumb]:shadow-[0_0_0_0.25rem_rgba(45,132,255,0.16)] " +
  "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#4b85d3cc] [&::-moz-range-thumb]:bg-[#f4f8ff]";

const shellPanelClass =
  "rounded-[1.125rem] border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]";

type SoundCardProps = {
  id: string;
  title: string;
  group: string;
  icon: LucideIcon;
  enabled: boolean;
  volume: number;
  favorite: boolean;
  onToggle: (soundId: string) => void;
  onVolume: (soundId: string, volume: number) => void;
  onFavorite: (soundId: string) => void;
};

/**
 * Memoized so dragging one volume slider only re-renders that card instead of
 * all ~43 of them on every input event.
 */
const SoundCard = memo(function SoundCard({
  id,
  title,
  group,
  icon: Icon,
  enabled,
  volume,
  favorite,
  onToggle,
  onVolume,
  onFavorite,
}: SoundCardProps) {
  return (
    <article
      onClick={() => onToggle(id)}
      className={`rounded-2xl border p-3 cursor-pointer select-none transition-all duration-300 ${
        enabled
          ? "border-[#5695e4c2] bg-gradient-to-br from-[#14385ebd] to-[#0b2139cc] shadow-[0_0.625rem_1.375rem_rgba(4,16,28,0.34),inset_0_0_0_1px_rgba(95,156,236,0.22)] hover:border-[#73acfc] hover:shadow-[0_0.75rem_1.75rem_rgba(4,16,28,0.4)]"
          : "border-[#6695ca3d] bg-[#0e27428f] hover:border-[#477bc2a0] hover:bg-[#122e4dcf]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#78a5db3d] bg-[#133150b3] text-[#c4d6eb]">
            <Icon size={16} />
          </span>
          <div>
            <h3 className="text-xl font-medium leading-tight text-[#f0f5fc]">{title}</h3>
            <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.08em] text-[#7e9bbb]">{group}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(event) => onVolume(id, Number(event.currentTarget.value))}
          onClick={(event) => event.stopPropagation()}
          className={rangeClass}
          aria-label={`${title} volume`}
        />
        <span className="text-base text-[#9db2c9]">{Math.round(volume * 100)}%</span>
        <button
          type="button"
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent ${
            favorite ? "text-[#7fc1ff]" : "text-[#8ea6bf]"
          } hover:border-[#6a94c559] hover:bg-[#102b488f] hover:text-[#e3effe]`}
          onClick={(event) => {
            event.stopPropagation();
            onFavorite(id);
          }}
          aria-label={`Favorite ${title}`}
        >
          <Heart size={14} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
});

export function MixerPage({
  isPlaying,
  settings,
  activeCount,
  activeScene,
  savedScenes,
  onTogglePlayback,
  onMasterVolume,
  onToggleSound,
  onSoundVolume,
  onToggleFavorite,
  onToggleMultipleSounds,
  onApplyScene,
  onSaveScene,
  onCreateScene,
  onSetDefaultScene,
  onManageScenes,
  onOpenSceneFullscreen,
  onOpenFocusSession,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [showSidebar, setShowSidebar] = useState(() => {
    try {
      const saved = localStorage.getItem("oceanic.showSidebar");
      return saved !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("oceanic.showSidebar", String(showSidebar));
    } catch {}
  }, [showSidebar]);

  const categoryTabs = useMemo(() => ["All", ...SOUND_GROUPS.map((group) => group.group)], []);

  const allSounds = useMemo(
    () =>
      SOUND_GROUPS.flatMap((group) =>
        group.sounds.map((sound) => ({
          ...sound,
          group: group.group,
        })),
      ),
    [],
  );

  const filteredSounds = useMemo(
    () =>
      allSounds.filter((sound) => {
        if (activeCategory !== "All" && sound.group !== activeCategory) {
          return false;
        }
        if (favoritesOnly && !settings.favorite[sound.id]) {
          return false;
        }
        if (settings.hideInactiveSounds && !settings.enabled[sound.id]) {
          return false;
        }
        return true;
      }),
    [allSounds, activeCategory, favoritesOnly, settings.favorite, settings.hideInactiveSounds, settings.enabled],
  );

  const handleSelectAll = () => {
    const soundIds = filteredSounds.map((sound) => sound.id);
    onToggleMultipleSounds(soundIds, true);
  };

  const handleDeselectAll = () => {
    const soundIds = filteredSounds.map((sound) => sound.id);
    onToggleMultipleSounds(soundIds, false);
  };

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <div className={`grid h-full gap-3 ${
        showSidebar
          ? "grid-cols-[minmax(0,1fr)_23.75rem] max-[1023px]:grid-cols-1"
          : "grid-cols-1"
      } max-[1023px]:h-auto max-[1023px]:overflow-y-auto pr-1`}>
        <section className={`${shellPanelClass} flex min-h-0 flex-col overflow-hidden`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-6 border-b border-[#6695ca33] px-6 py-4 lg:px-8 lg:pb-6 lg:pt-5">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 order-1 xl:order-none col-span-1">
              <button
                type="button"
                className="inline-flex h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18 shrink-0 items-center justify-center rounded-[1.125rem] lg:rounded-[1.25rem] border border-[#4787d29e] bg-gradient-to-b from-[#2478e0a3] to-[#0f3152f5] text-[#f5f9ff] shadow-[0_0.875rem_1.5rem_rgba(2,12,24,0.4),inset_0_0_0_1px_rgba(130,174,228,0.18)] hover:from-[#2d82e8] hover:to-[#143d66] transition-all duration-300 active:scale-95"
                onClick={onTogglePlayback}
                aria-label={isPlaying ? "Pause playback" : "Resume playback"}
              >
                {isPlaying ? <Pause size={24} className="lg:h-[28px] lg:w-[28px]" fill="currentColor" /> : <Play size={24} className="lg:h-[28px] lg:w-[28px]" fill="currentColor" />}
              </button>

              <div className="min-w-0">
                <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">ACTIVE SCENE</p>
                <h1 className="mt-1 truncate text-xl sm:text-2xl lg:text-3xl font-semibold leading-[0.9] tracking-[-0.02em]">
                  {activeScene?.title ?? "No Scene Selected"}
                </h1>
              </div>
            </div>

            <div className="flex min-w-[200px] flex-col justify-center border-t border-[#6695ca24] pt-4 mt-2 xl:border-t-0 xl:border-l xl:pl-8 xl:pt-0 xl:mt-0 order-3 xl:order-none col-span-1 md:col-span-2 xl:col-span-1">
              <div className="mb-1.5 flex items-center gap-2 text-sm sm:text-base text-[#d6e1f0]">
                <AudioLines size={16} />
                <span>Master Volume</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={settings.masterVolume}
                  onChange={(event) => onMasterVolume(Number(event.currentTarget.value))}
                  className={`${rangeClass} flex-1`}
                />
                <span className="w-[3.5rem] sm:w-[4.5rem] shrink-0 whitespace-nowrap text-right text-xl sm:text-2xl lg:text-3xl font-semibold leading-none text-[#d6e1f0]">
                  {Math.round(settings.masterVolume * 100)}%
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-l-0 md:border-l border-[#6695ca24] md:pl-4 xl:pl-8 order-2 xl:order-none col-span-1 justify-end">
              <button
                type="button"
                onClick={onOpenFocusSession}
                className="inline-flex items-center gap-2 rounded-[0.875rem] border border-[#6a94c552] bg-[#102b488f] px-4 py-2 text-sm text-[#dbe9f8] hover:border-[#6a94c599] hover:bg-[#19406bc2] transition-colors"
              >
                <Timer size={16} />
                Focus Session
              </button>
              <button
                type="button"
                onClick={() => setShowSidebar(prev => !prev)}
                className={`inline-flex h-[40px] w-[40px] sm:h-[46px] sm:w-[46px] shrink-0 items-center justify-center rounded-[0.75rem] lg:rounded-[0.875rem] border border-[#6a94c552] bg-[#102b488f] text-[#dbe9f8] hover:bg-[#19406bc2] hover:border-[#6a94c58f] transition-all duration-300 active:scale-95 ${
                  !showSidebar ? "border-[#4d9cff] text-[#4d9cff] bg-[#102b48db]" : ""
                }`}
                title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                aria-label={showSidebar ? "Hide right sidebar" : "Show right sidebar"}
              >
                {showSidebar ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {categoryTabs.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      activeCategory === category
                        ? "border-[#508fe4b8] bg-gradient-to-b from-[#267ae1b8] to-[#163f71e0] text-[#eff6ff]"
                        : "border-[#6c9dd63d] bg-[#102a4875] text-[#9fb4ca]"
                    }`}
                onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-4 py-1.5 text-sm text-[#9fb4ca] hover:border-[#6c9dd666] hover:bg-[#15345775] transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="rounded-full border border-[#6c9dd63d] bg-[#102a4875] px-4 py-1.5 text-sm text-[#9fb4ca] hover:border-[#6c9dd666] hover:bg-[#15345775] transition-colors"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  className={`inline-flex min-w-[8.75rem] items-center justify-center gap-2 rounded-full border px-4 py-1.5 text-sm ${
                    favoritesOnly
                      ? "border-[#508fe4b8] bg-gradient-to-b from-[#267ae1b8] to-[#163f71e0] text-[#eff6ff]"
                      : "border-[#6c9dd63d] bg-[#102a4875] text-[#9fb4ca]"
                  }`}
                  onClick={() => setFavoritesOnly((prev) => !prev)}
                >
                  <Heart size={14} />
                  Favorites
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-[1700px]:grid-cols-2 max-[1100px]:grid-cols-1">
              {filteredSounds.map((sound, index) => {
                const enabled = settings.enabled[sound.id] ?? false;
                const volume = settings.perSoundVolume[sound.id] ?? sound.defaultVolume ?? 0.6;
                const favorite = settings.favorite[sound.id] ?? false;
                const Icon = soundIconMap[sound.icon ?? "noise"] ?? AudioLines;
                const showDivider =
                  activeCategory === "All" &&
                  (index === 0 || sound.group !== filteredSounds[index - 1].group);

                return (
                  <Fragment key={sound.id}>
                    {showDivider && (
                      <div className="col-span-full mt-2 mb-1 flex items-center gap-3 px-1 text-sm tracking-widest text-[#88a2c0]">
                        <span className="font-semibold uppercase">{sound.group}</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#6695ca40] to-transparent" />
                      </div>
                    )}
                    <SoundCard
                      id={sound.id}
                      title={sound.title}
                      group={sound.group}
                      icon={Icon}
                      enabled={enabled}
                      volume={volume}
                      favorite={favorite}
                      onToggle={onToggleSound}
                      onVolume={onSoundVolume}
                      onFavorite={onToggleFavorite}
                    />
                  </Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {showSidebar && (
          <aside className={`${shellPanelClass} flex min-h-0 flex-col gap-3 p-3 overflow-y-auto`}>
            {activeScene ? (
              <article className="relative overflow-hidden rounded-2xl border border-[#6a94c53d] bg-[#0c233cc2] shrink-0">
                <img src={activeScene.thumbnail} alt={activeScene.title} className="h-[18.125rem] w-full object-cover" loading="eager" decoding="async" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent via-[#071c32c2] to-[#071c32f7]" />
                <div className="absolute inset-x-0 bottom-0 z-[1] p-4">
                  <h2 className="text-[2rem] font-semibold leading-[0.93] tracking-[-0.02em] text-[#eaf2fc]">
                    {activeScene.title}
                  </h2>
                  <span className="mt-2 inline-flex rounded-xl border border-[#508bd999] bg-[#2c80e238] px-2.5 py-0.5 text-[0.6875rem] uppercase tracking-[0.05em] text-[#84b8ff]">
                    {activeScene.isDefault ? "Default Scene" : "Saved Scene"}
                  </span>
                  <p className="mt-3 text-sm font-normal leading-[1.4] text-[#9eb3c9]">{activeScene.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 text-[#dbe9f8] hover:border-[#6a94c599] transition-colors"
                      type="button"
                      onClick={() => onSaveScene(activeScene.id)}
                    >
                      <Bookmark size={14} /> <span className="text-[13px] font-medium">Save</span>
                    </button>
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 text-[#dbe9f8] hover:border-[#6a94c599] transition-colors"
                      type="button"
                      onClick={() => onSetDefaultScene(activeScene.id)}
                    >
                      <Heart size={14} /> <span className="text-[13px] font-medium">Default</span>
                    </button>
                    <button
                      className="inline-flex h-8 items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 text-[#dbe9f8] hover:border-[#6a94c599] transition-colors"
                      type="button"
                      onClick={() => onOpenSceneFullscreen(activeScene.id)}
                    >
                      <Play size={14} fill="currentColor" /> <span className="text-[13px] font-medium">Play</span>
                    </button>
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#6a94c552] bg-[#102b488f] text-[#dbe9f8] hover:border-[#6a94c599] transition-colors"
                      type="button"
                      aria-label="Scene actions"
                      onClick={onManageScenes}
                    >
                      <CircleEllipsis size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ) : null}

            <section className="shrink-0 flex flex-col min-h-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs tracking-[0.16em] text-[#88a2c0]">MY SCENES</p>
                <button className="text-base text-[#4d9cff] hover:text-[#7ebaff] transition-colors" type="button" onClick={onManageScenes}>
                  Manage
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#6a94c538]">
                {savedScenes.slice(0, 8).map((scene) => (
                  <div
                    key={scene.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onApplyScene(scene.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onApplyScene(scene.id);
                      }
                    }}
                    className={`grid w-full grid-cols-[2.5rem_1fr_1.5rem] items-center gap-2 border-b border-[#6a94c526] px-2 py-2 text-left outline-none ${
                      activeScene?.id === scene.id
                        ? "border-l-2 border-l-[#5f9cec] bg-gradient-to-r from-[#2d82ea47] to-[#122d4a9e]"
                        : "bg-[#0e26418a] hover:bg-[#133254b3] transition-colors"
                    }`}
                  >
                    <img src={scene.thumbnail} alt={scene.title} className="h-6 w-10 rounded object-cover" loading="lazy" decoding="async" />
                    <span className="text-base text-[#f0f5fc]">{scene.title}</span>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#8ea6bf] hover:bg-[#102b488f] hover:text-[#e3effe]"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenSceneFullscreen(scene.id);
                      }}
                      aria-label={`Play ${scene.title}`}
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={onCreateScene}
                  className="w-full rounded-b-2xl border border-x-0 border-b-0 border-t-[#6a94c54d] bg-[#0c2239ba] py-2 text-base text-[#dce9f7] hover:bg-[#143253ba] transition-colors"
                >
                  + New Scene
                </button>
              </div>
            </section>

            <section className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 rounded-2xl border border-[#6a94c533] bg-[#0c233c8c] p-3 shrink-0">
              <div className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full border-2 border-[#3f88e4db] text-xl">
                {savedScenes.find((scene) => scene.id === activeScene?.id)?.duration ?? 0}
              </div>
              <div>
                <p className="text-lg">Focus Session</p>
                <p className="text-sm text-[#91a7bf]">Stay present. We&apos;ll keep the atmosphere steady.</p>
              </div>
              <button
                type="button"
                onClick={onOpenFocusSession}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6a94c55c] bg-[#112c4ac2] text-[#f0f7ff] hover:bg-[#19406bc2] hover:border-[#6a94c58f] transition-all duration-300 active:scale-95"
                aria-label="Open focus session"
              >
                <Play size={16} fill="currentColor" />
              </button>
            </section>

            <p className="text-right text-[0.8125rem] text-[#91a7bf] shrink-0">{activeCount} active sounds</p>
          </aside>
        )}
      </div>
    </main>
  );
}
