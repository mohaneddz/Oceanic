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
  theme: ThemeName;
  hideInactiveSounds: boolean;
  autoPlayOnLaunch: boolean;
};
