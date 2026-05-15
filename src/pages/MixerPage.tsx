import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import {
  AudioLines,
  Bird,
  Bookmark,
  ChevronDown,
  CircleEllipsis,
  CloudLightning,
  CloudRain,
  Coffee,
  Flame,
  Heart,
  MonitorPause,
  Pause,
  Play,
  Timer,
  TrainFront,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { SCENES } from "../lib/scenes";
import { SOUND_GROUPS } from "../lib/sounds";
import type { OceanicSettings } from "../lib/types";


type Props = {
  isPlaying: boolean;
  settings: OceanicSettings;
  activeCount: number;
  onTogglePlayback: () => void;
  onMasterVolume: (value: number) => void;
  onToggleSound: (soundId: string) => void;
  onSoundVolume: (soundId: string, volume: number) => void;
  onToggleFavorite: (soundId: string) => void;
  onSleepTimer: (minutes: number | null) => void;
  onFadeOut: (minutes: number | null) => void;
  onToggleAutoPlayOnLaunch: () => void;
};

const soundIconMap: Record<string, LucideIcon> = {
  rain: CloudRain,
  storm: CloudLightning,
  wind: Wind,
  waves: Waves,
  stream: AudioLines,
  birds: Bird,
  "summer-night": Bird,
  train: TrainFront,
  boat: Waves,
  city: AudioLines,
  "coffee-shop": Coffee,
  fireplace: Flame,
  "pink-noise": AudioLines,
  "white-noise": AudioLines,
};

const SLEEP_TIMER_OPTIONS = [
  { label: "Off", value: null },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

const FADE_OUT_OPTIONS = [
  { label: "Off", value: null },
  { label: "1 min", value: 1 },
  { label: "3 min", value: 3 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "30 min", value: 30 },
];

type TimerOption = {
  label: string;
  value: number | null;
};

const rangeClass =
  "h-1 w-full cursor-pointer appearance-none rounded-full bg-[#2d7de4] accent-[#2f89ff] " +
  "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#4b85d3cc] [&::-webkit-slider-thumb]:bg-[#f4f8ff] [&::-webkit-slider-thumb]:shadow-[0_0_0_0.25rem_rgba(45,132,255,0.16)] " +
  "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#4b85d3cc] [&::-moz-range-thumb]:bg-[#f4f8ff]";

const shellPanelClass =
  "rounded-[1.125rem] border border-[#6a94c533] bg-gradient-to-br from-[#0c233cdb] to-[#08192bed] shadow-[0_1.375rem_3.75rem_rgba(0,0,0,0.34)]";

export function MixerPage({
  isPlaying,
  settings,
  activeCount,
  onTogglePlayback,
  onMasterVolume,
  onToggleSound,
  onSoundVolume,
  onToggleFavorite,
  onSleepTimer,
  onFadeOut,
  onToggleAutoPlayOnLaunch,
}: Props) {
  const [activeSceneId, setActiveSceneId] = useState(SCENES[0].id);
  const activeScene = SCENES.find((scene) => scene.id === activeSceneId) ?? SCENES[0];
  const [activeCategory, setActiveCategory] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [openMenu, setOpenMenu] = useState<"sleep" | "fade" | null>(null);
  const sleepCardRef = useRef<HTMLDivElement | null>(null);
  const fadeCardRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!openMenu) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideSleep = sleepCardRef.current?.contains(target);
      const insideFade = fadeCardRef.current?.contains(target);

      if (!insideSleep && !insideFade) {
        setOpenMenu(null);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [openMenu]);

  const selectedSleepLabel =
    SLEEP_TIMER_OPTIONS.find((option) => option.value === settings.sleepTimerMinutes)?.label ?? "Off";
  const selectedFadeLabel =
    FADE_OUT_OPTIONS.find((option) => option.value === settings.fadeOutMinutes)?.label ?? "Off";

  const renderDropdownCard = ({
    title,
    icon,
    options,
    selectedLabel,
    menuKey,
    onSelect,
    cardRef,
  }: {
    title: string;
    icon: React.ReactNode;
    options: TimerOption[];
    selectedLabel: string;
    menuKey: "sleep" | "fade";
    onSelect: (value: number | null) => void;
    cardRef: React.RefObject<HTMLDivElement>;
  }) => (
    <div
      ref={cardRef}
      className="relative min-w-[140px] rounded-[1.25rem] border border-[#6695ca40] bg-[#0d254099] px-4 py-3"
    >
      <p className="mb-2 flex items-center gap-2 whitespace-nowrap text-[#91a7bf]">
        {icon}
        <span className="text-base leading-none max-[112.5rem]:text-sm">{title}</span>
      </p>

      <button
        type="button"
        onClick={() => setOpenMenu((prev) => (prev === menuKey ? null : menuKey))}
        className="flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-[0.875rem] border border-[#6a94c538] bg-[#143253b3] px-3 py-2 text-left text-[1.5rem] font-semibold leading-[0.9] tracking-[-0.02em] text-[#f2f7ff] shadow-inner max-[112.5rem]:text-[1.25rem] hover:border-[#6a94c56e] hover:bg-[#1a3d63b3] focus:outline-none focus:ring-2 focus:ring-[#3e88e7]"
        aria-haspopup="listbox"
        aria-expanded={openMenu === menuKey}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={18} className="shrink-0 text-[#d5e3f4]" />
      </button>

      {openMenu === menuKey ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-[#6a94c55c] bg-[#0c233cf5] p-2 shadow-[0_1.125rem_2.125rem_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="max-h-64 overflow-auto pr-1">
            {options.map((option) => {
              const isActive = option.label === selectedLabel;
              return (
                <button
                  key={option.label}
                  type="button"
                  className={`mb-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-[1.25rem] leading-none max-[112.5rem]:text-base ${
                    isActive
                      ? "bg-[#2f89ff33] text-[#f0f6ff]"
                      : "text-[#c7d6e8] hover:bg-[#1b3f668f] hover:text-[#f0f6ff]"
                  }`}
                  onClick={() => {
                    onSelect(option.value);
                    setOpenMenu(null);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <main className="h-full w-full overflow-hidden p-5 text-[#f0f5fc]">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_23.75rem] gap-3 max-[87.5rem]:grid-cols-1">
        <section className={`${shellPanelClass} flex min-h-0 flex-col overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-[#6695ca33] px-8 pb-6 pt-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs tracking-[0.16em] text-[#8ca4c0]">ACTIVE SCENE</p>
              <h1 className="mt-1 truncate text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.9] tracking-[-0.02em]">
                {activeScene.title}
              </h1>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-4 max-[112.5rem]:gap-3">
              <button
                type="button"
                className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.375rem] border border-[#4787d29e] bg-gradient-to-b from-[#2478e0a3] to-[#0f3152f5] text-[#f5f9ff] shadow-[0_0.875rem_1.5rem_rgba(2,12,24,0.4),inset_0_0_0_1px_rgba(130,174,228,0.18)]"
                onClick={onTogglePlayback}
                aria-label={isPlaying ? "Pause playback" : "Resume playback"}
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
              </button>

              <div className="flex min-w-[260px] flex-1 flex-col justify-center border-l border-[#6695ca40] pl-6 lg:min-w-[320px] lg:pl-8">
                <div className="mb-2 flex items-center gap-2 text-base text-[#d6e1f0]">
                  <AudioLines size={18} />
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
                  <span className="w-[4.5rem] shrink-0 whitespace-nowrap text-right text-[2.25rem] font-semibold leading-none text-[#d6e1f0] max-[112.5rem]:text-[1.875rem]">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 border-l border-[#6695ca40] pl-6 lg:gap-5 lg:pl-8">
                {renderDropdownCard({
                  title: "Sleep Timer",
                  icon: <Timer size={18} />,
                  options: SLEEP_TIMER_OPTIONS,
                  selectedLabel: selectedSleepLabel,
                  menuKey: "sleep",
                  onSelect: onSleepTimer,
                  cardRef: sleepCardRef,
                })}

                {renderDropdownCard({
                  title: "Fade Out",
                  icon: <MonitorPause size={18} />,
                  options: FADE_OUT_OPTIONS,
                  selectedLabel: selectedFadeLabel,
                  menuKey: "fade",
                  onSelect: onFadeOut,
                  cardRef: fadeCardRef,
                })}
              </div>
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

            <div className="grid grid-cols-3 gap-2.5 max-[106.25rem]:grid-cols-2 max-[68.75rem]:grid-cols-1">
              {filteredSounds.map((sound, index) => {
                const enabled = settings.enabled[sound.id] ?? false;
                const volume = settings.perSoundVolume[sound.id] ?? 0.6;
                const favorite = settings.favorite[sound.id] ?? false;
                const Icon = soundIconMap[sound.id] ?? AudioLines;
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
                    <article
                      className={`rounded-2xl border p-3 ${
                      enabled
                        ? "border-[#5695e4c2] bg-gradient-to-br from-[#14385ebd] to-[#0b2139cc] shadow-[0_0.625rem_1.375rem_rgba(4,16,28,0.34),inset_0_0_0_1px_rgba(95,156,236,0.22)]"
                        : "border-[#6695ca3d] bg-[#0e27428f]"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#78a5db3d] bg-[#133150b3] text-[#c4d6eb]">
                          <Icon size={16} />
                        </span>
                        <div>
                          <h3 className="text-xl font-medium leading-tight text-[#f0f5fc]">{sound.title}</h3>
                          <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.08em] text-[#7e9bbb]">{sound.group}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`relative h-5 w-10 rounded-full border transition ${
                          enabled
                            ? "border-[#5d99e9d9] bg-gradient-to-b from-[#2a87ff] to-[#246fd6]"
                            : "border-[#6c9dd647] bg-[#7b96b45c]"
                        }`}
                        onClick={() => onToggleSound(sound.id)}
                        aria-label={`Toggle ${sound.title}`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#e8f1ff] transition-transform ${
                            enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(event) => onSoundVolume(sound.id, Number(event.currentTarget.value))}
                        className={rangeClass}
                      />
                      <span className="text-base text-[#9db2c9]">{Math.round(volume * 100)}%</span>
                      <button
                        type="button"
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent ${
                          favorite ? "text-[#7fc1ff]" : "text-[#8ea6bf]"
                        } hover:border-[#6a94c559] hover:bg-[#102b488f] hover:text-[#e3effe]`}
                        onClick={() => onToggleFavorite(sound.id)}
                        aria-label={`Favorite ${sound.title}`}
                      >
                        <Heart size={14} fill={favorite ? "currentColor" : "none"} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[#8ea6bf] hover:border-[#6a94c559] hover:bg-[#102b488f] hover:text-[#e3effe]"
                        aria-label={`${sound.title} actions`}
                      >
                        <CircleEllipsis size={14} />
                      </button>
                    </div>
                  </article>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </section>

        <aside className={`${shellPanelClass} flex min-h-0 flex-col gap-3 p-3`}>
          <article className="relative overflow-hidden rounded-2xl border border-[#6a94c53d] bg-[#0c233cc2]">
            <img src={activeScene.thumbnail} alt={activeScene.title} className="h-[18.125rem] w-full object-cover" loading="eager" decoding="async" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent via-[#071c32c2] to-[#071c32f7]" />
            <div className="absolute inset-x-0 bottom-0 z-[1] p-4">
              <h2 className="text-[2rem] font-semibold leading-[0.93] tracking-[-0.02em] text-[#eaf2fc]">
                {activeScene.title}
              </h2>
              <span className="mt-2 inline-flex rounded-xl border border-[#508bd999] bg-[#2c80e238] px-2.5 py-0.5 text-[0.6875rem] uppercase tracking-[0.05em] text-[#84b8ff]">
                Active
              </span>
              <p className="mt-3 text-sm font-normal leading-[1.4] text-[#9eb3c9]">{activeScene.description}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className="inline-flex h-8 items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 text-[#dbe9f8]"
                  type="button"
                  onClick={() => setActiveSceneId(activeScene.id)}
                >
                  <Bookmark size={14} /> <span className="text-[13px] font-medium">Save</span>
                </button>
                <button
                  className="inline-flex h-8 items-center gap-2 rounded-xl border border-[#6a94c552] bg-[#102b488f] px-3 text-[#dbe9f8]"
                  type="button"
                  onClick={() => setActiveSceneId(SCENES[0].id)}
                >
                  <Heart size={14} /> <span className="text-[13px] font-medium">Default</span>
                </button>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#6a94c552] bg-[#102b488f] text-[#dbe9f8]"
                  type="button"
                  aria-label="Scene actions"
                  onClick={() => setActiveSceneId(SCENES[(SCENES.findIndex((s) => s.id === activeScene.id) + 1) % SCENES.length].id)}
                >
                  <CircleEllipsis size={14} />
                </button>
              </div>
            </div>
          </article>

          <section className="min-h-0">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs tracking-[0.16em] text-[#88a2c0]">MY SCENES</p>
              <button className="text-base text-[#4d9cff]" type="button" onClick={() => setActiveSceneId(SCENES[0].id)}>
                Manage
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#6a94c538]">
              {SCENES.slice(0, 5).map((scene) => (
                <button
                  type="button"
                  key={scene.id}
                  onClick={() => setActiveSceneId(scene.id)}
                  className={`grid grid-cols-[2.5rem_1fr_1.5rem] items-center gap-2 border-b border-[#6a94c526] px-2 py-2 ${
                    activeSceneId === scene.id
                      ? "border-l-2 border-l-[#5f9cec] bg-gradient-to-r from-[#2d82ea47] to-[#122d4a9e]"
                      : "bg-[#0e26418a]"
                  }`}
                >
                  <img src={scene.thumbnail} alt={scene.title} className="h-6 w-10 rounded object-cover" loading="lazy" decoding="async" />
                  <span className="text-base text-[#f0f5fc]">{scene.title}</span>
                  <CircleEllipsis size={14} className="text-[#8ea6bf]" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveSceneId(SCENES[SCENES.length - 1].id)}
                className="w-full rounded-b-2xl border border-x-0 border-b-0 border-t-[#6a94c54d] bg-[#0c2239ba] py-2 text-base text-[#dce9f7]"
              >
                + New Scene
              </button>
            </div>
          </section>

          <section className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 rounded-2xl border border-[#6a94c533] bg-[#0c233c8c] p-3">
            <div className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full border-2 border-[#3f88e4db] text-xl">50</div>
            <div>
              <p className="text-lg">Focus Session</p>
              <p className="text-sm text-[#91a7bf]">Stay present. We&apos;ll keep the atmosphere steady.</p>
            </div>
            <button
              type="button"
              onClick={onTogglePlayback}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#6a94c55c] bg-[#112c4ac2] text-[#f0f7ff]"
              aria-label="Start focus"
            >
              <Play size={16} fill="currentColor" />
            </button>
          </section>

          <section className="flex items-center justify-between gap-2 rounded-2xl border border-[#6a94c538] bg-[#0d254094] p-3">
            <div>
              <p className="text-base">Auto resume last scene</p>
              <p className="mt-1 text-[0.8125rem] text-[#91a7bf]">Start playback when app opens</p>
            </div>
            <button
              className={`relative h-5 w-10 rounded-full border transition ${
                settings.autoPlayOnLaunch
                  ? "border-[#5d99e9d9] bg-gradient-to-b from-[#2a87ff] to-[#246fd6]"
                  : "border-[#6c9dd647] bg-[#7b96b45c]"
              }`}
              type="button"
              aria-label="Toggle auto resume last scene"
              onClick={onToggleAutoPlayOnLaunch}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#e8f1ff] transition-transform ${
                  settings.autoPlayOnLaunch ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </section>

          <p className="text-right text-[0.8125rem] text-[#91a7bf]">{activeCount} active sounds</p>
        </aside>
      </div>
    </main>
  );
}
