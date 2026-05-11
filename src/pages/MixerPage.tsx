import type { OceanicSettings } from "../lib/types";
import { SOUND_GROUPS } from "../lib/sounds";

type Props = {
  isPlaying: boolean;
  settings: OceanicSettings;
  activeCount: number;
  onTogglePlayback: () => void;
  onMasterVolume: (value: number) => void;
  onToggleSound: (soundId: string) => void;
  onSoundVolume: (soundId: string, volume: number) => void;
};

export function MixerPage({
  isPlaying,
  settings,
  activeCount,
  onTogglePlayback,
  onMasterVolume,
  onToggleSound,
  onSoundVolume,
}: Props) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-5 md:px-8">
      <section className="themed-card rounded-3xl border p-5 shadow-panel backdrop-blur md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em]">Ambient Mixer</p>
            <h1 className="mt-1 text-3xl font-semibold">Oceanic Blanket MVP</h1>
            <p className="themed-text-muted mt-2 text-sm">
              {activeCount} active sounds across {SOUND_GROUPS.length} groups.
            </p>
          </div>
          <button
            type="button"
            onClick={onTogglePlayback}
            className="themed-btn-primary rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition"
          >
            {isPlaying ? "Pause All" : "Play All"}
          </button>
        </div>

        <div className="themed-soft mt-5 rounded-2xl border p-4">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="master-volume" className="text-sm font-medium">
              Master Volume
            </label>
            <span className="text-sm font-semibold">{Math.round(settings.masterVolume * 100)}%</span>
          </div>
          <input
            id="master-volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.masterVolume}
            onChange={(event) => onMasterVolume(Number(event.currentTarget.value))}
            className="themed-range h-2 w-full cursor-pointer appearance-none rounded-lg border themed-soft"
          />
        </div>
      </section>

      <section className="space-y-4">
        {SOUND_GROUPS.map((group) => (
          <article key={group.group} className="themed-card rounded-3xl border p-4 shadow-panel backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold">{group.group}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.sounds
                .filter((sound) => !settings.hideInactiveSounds || settings.enabled[sound.id])
                .map((sound) => {
                  const enabled = settings.enabled[sound.id];
                  const volume = settings.perSoundVolume[sound.id] ?? 0.6;
                  return (
                    <div key={sound.id} className="themed-soft rounded-2xl border p-3 transition">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{sound.title}</p>
                        <button
                          type="button"
                          onClick={() => onToggleSound(sound.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            enabled ? "themed-btn-primary" : "themed-btn-ghost border"
                          }`}
                        >
                          {enabled ? "On" : "Off"}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={(event) => onSoundVolume(sound.id, Number(event.currentTarget.value))}
                          className="themed-range h-2 w-full cursor-pointer appearance-none rounded-lg border themed-soft"
                        />
                        <span className="w-10 text-right text-xs font-semibold">{Math.round(volume * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
