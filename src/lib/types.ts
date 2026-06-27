export type SoundIconName =
  | "rain"
  | "storm"
  | "wind"
  | "waves"
  | "stream"
  | "birds"
  | "night"
  | "train"
  | "boat"
  | "city"
  | "coffee"
  | "fireplace"
  | "fan"
  | "plane"
  | "camp"
  | "leaves"
  | "noise";

export type SoundDefinition = {
  id: string;
  title: string;
  file: string;
  group: string;
  icon?: SoundIconName;
  defaultVolume?: number;
  loopStart?: number;
  loopEnd?: number;
};

export type SoundGroup = {
  group: string;
  sounds: SoundDefinition[];
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
  selectedSceneId: string | null;
  lastAppliedSceneId: string | null;
};

export type SavedScene = {
  id: string;
  title: string;
  description: string;
  duration: number;
  tags: string[];
  thumbnail: string;
  video: string;
  favorite: boolean;
  isDefault: boolean;
  soundIds: string[];
  soundVolumes: Record<string, number>;
  updatedAt: number;
};

export type TimerPreset = {
  id: string;
  title: string;
  desc: string;
  focusMinutes: number;
  breakMinutes: number;
  sceneId: string;
  fadeOutAtEnd: boolean;
  breakReminders: boolean;
  autoStartNextSession: boolean;
  distractionFree: boolean;
};

export type TimerPhase = "focus" | "break";

export type TimerSessionState = {
  activePresetId: string | null;
  phase: TimerPhase;
  isRunning: boolean;
  remainingSeconds: number;
  endsAt: number | null;
  completedCycles: number;
  notification: string | null;
};
