export type SoundItem = {
  id: string;
  title: string;
  file: string;
};

export type SoundGroup = {
  group: string;
  sounds: SoundItem[];
};

export type ThemeName = "light" | "dark" | "cherry" | "acacia" | "oceanic";

export type RustSettings = {
  minimizeToTray: boolean;
  startMinimized: boolean;
};

export type OceanicSettings = RustSettings & {
  masterVolume: number;
  perSoundVolume: Record<string, number>;
  enabled: Record<string, boolean>;
  favorite: Record<string, boolean>;
  sleepTimerMinutes: number | null;
  fadeOutMinutes: number | null;
  theme: ThemeName;
  hideInactiveSounds: boolean;
  autoPlayOnLaunch: boolean;
  audioDucking: boolean;
  fadeOutOnClose: boolean;
  fadeOutDuration: number;
  globalMediaHotkeys: boolean;
  reduceMotion: boolean;
  largerUI: boolean;
};
