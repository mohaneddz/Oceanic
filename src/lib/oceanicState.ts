import { ALL_SOUNDS } from "./sounds";
import { SCENES } from "./scenes";
import type {
  OceanicSettings,
  SavedScene,
  TimerPreset,
  TimerSessionState,
} from "./types";

const defaultVolumeMap = () =>
  Object.fromEntries(ALL_SOUNDS.map((sound) => [sound.id, sound.defaultVolume ?? 0.6]));

const defaultEnabledMap = () => Object.fromEntries(ALL_SOUNDS.map((sound) => [sound.id, false]));

const defaultFavoriteMap = () => Object.fromEntries(ALL_SOUNDS.map((sound) => [sound.id, false]));

export function createDefaultSettings(): OceanicSettings {
  const perSoundVolume = defaultVolumeMap();
  const enabled = defaultEnabledMap();
  const favorite = defaultFavoriteMap();

  favorite.rain = true;
  favorite.waves = true;
  favorite.stream = true;
  favorite["white-noise"] = true;
  favorite["soft-rain"] = true;
  favorite["coffee-shop"] = true;

  enabled.rain = true;
  enabled.waves = true;

  return {
    minimizeToTray: true,
    startMinimized: false,
    masterVolume: 0.7,
    perSoundVolume,
    enabled,
    favorite,
    sleepTimerMinutes: null,
    fadeOutMinutes: 30,
    theme: "oceanic",
    hideInactiveSounds: false,
    autoPlayOnLaunch: true,
    audioDucking: false,
    fadeOutOnClose: true,
    fadeOutDuration: 3,
    globalMediaHotkeys: false,
    reduceMotion: false,
    largerUI: false,
    selectedSceneId: "scene-0",
    lastAppliedSceneId: "scene-0",
  };
}

export function sanitizeSettings(input: unknown): OceanicSettings {
  const fallback = createDefaultSettings();
  if (!input || typeof input !== "object") {
    return fallback;
  }

  const parsed = input as Partial<OceanicSettings>;

  return {
    minimizeToTray:
      typeof parsed.minimizeToTray === "boolean" ? parsed.minimizeToTray : fallback.minimizeToTray,
    startMinimized:
      typeof parsed.startMinimized === "boolean" ? parsed.startMinimized : fallback.startMinimized,
    masterVolume:
      typeof parsed.masterVolume === "number" ? parsed.masterVolume : fallback.masterVolume,
    perSoundVolume: { ...fallback.perSoundVolume, ...(parsed.perSoundVolume ?? {}) },
    enabled: { ...fallback.enabled, ...(parsed.enabled ?? {}) },
    favorite: { ...fallback.favorite, ...(parsed.favorite ?? {}) },
    sleepTimerMinutes:
      typeof parsed.sleepTimerMinutes === "number" || parsed.sleepTimerMinutes === null
        ? parsed.sleepTimerMinutes
        : fallback.sleepTimerMinutes,
    fadeOutMinutes:
      typeof parsed.fadeOutMinutes === "number" || parsed.fadeOutMinutes === null
        ? parsed.fadeOutMinutes
        : fallback.fadeOutMinutes,
    theme:
      parsed.theme === "light" ||
      parsed.theme === "dark" ||
      parsed.theme === "cherry" ||
      parsed.theme === "acacia" ||
      parsed.theme === "oceanic"
        ? parsed.theme
        : fallback.theme,
    hideInactiveSounds:
      typeof parsed.hideInactiveSounds === "boolean"
        ? parsed.hideInactiveSounds
        : fallback.hideInactiveSounds,
    autoPlayOnLaunch:
      typeof parsed.autoPlayOnLaunch === "boolean"
        ? parsed.autoPlayOnLaunch
        : fallback.autoPlayOnLaunch,
    audioDucking:
      typeof parsed.audioDucking === "boolean" ? parsed.audioDucking : fallback.audioDucking,
    fadeOutOnClose:
      typeof parsed.fadeOutOnClose === "boolean"
        ? parsed.fadeOutOnClose
        : fallback.fadeOutOnClose,
    fadeOutDuration:
      typeof parsed.fadeOutDuration === "number"
        ? parsed.fadeOutDuration
        : fallback.fadeOutDuration,
    globalMediaHotkeys:
      typeof parsed.globalMediaHotkeys === "boolean"
        ? parsed.globalMediaHotkeys
        : fallback.globalMediaHotkeys,
    reduceMotion:
      typeof parsed.reduceMotion === "boolean" ? parsed.reduceMotion : fallback.reduceMotion,
    largerUI: typeof parsed.largerUI === "boolean" ? parsed.largerUI : fallback.largerUI,
    selectedSceneId:
      typeof parsed.selectedSceneId === "string" || parsed.selectedSceneId === null
        ? parsed.selectedSceneId
        : fallback.selectedSceneId,
    lastAppliedSceneId:
      typeof parsed.lastAppliedSceneId === "string" || parsed.lastAppliedSceneId === null
        ? parsed.lastAppliedSceneId
        : fallback.lastAppliedSceneId,
  };
}

export function createDefaultScenes(): SavedScene[] {
  const now = Date.now();
  const templates = [
    {
      sceneIndex: 0,
      title: "Oceanic Blanket",
      description: "Steady ocean rain for long, quiet focus.",
      tags: ["Rain", "Ocean", "Focus"],
      soundIds: ["rain", "waves", "deep-waves"],
      soundVolumes: { rain: 0.72, waves: 0.65, "deep-waves": 0.42 } as Record<string, number>,
      favorite: true,
      isDefault: true,
    },
    {
      sceneIndex: 3,
      title: "Rainy Day",
      description: "A darker storm blend with soft room texture.",
      tags: ["Storm", "Calm", "Indoor"],
      soundIds: ["soft-rain", "distant-thunder", "fan"],
      soundVolumes: { "soft-rain": 0.68, "distant-thunder": 0.32, fan: 0.28 } as Record<string, number>,
      favorite: true,
      isDefault: false,
    },
    {
      sceneIndex: 15,
      title: "Morning Calm",
      description: "Light forest air with water and birds.",
      tags: ["Morning", "Forest", "Fresh"],
      soundIds: ["stream", "forest-dawn", "birds"],
      soundVolumes: { stream: 0.6, "forest-dawn": 0.52, birds: 0.36 } as Record<string, number>,
      favorite: false,
      isDefault: false,
    },
    {
      sceneIndex: 16,
      title: "Night Escape",
      description: "Low movement, crickets, and far-off city hush.",
      tags: ["Night", "Ambient", "Low Light"],
      soundIds: ["summer-night", "crickets", "downtown-night"],
      soundVolumes: { "summer-night": 0.46, crickets: 0.44, "downtown-night": 0.22 } as Record<string, number>,
      favorite: false,
      isDefault: false,
    },
    {
      sceneIndex: 26,
      title: "Deep Focus",
      description: "Noise bed for sustained work blocks.",
      tags: ["Focus", "Noise", "Work"],
      soundIds: ["brown-noise", "focus-drone", "keyboard-room"],
      soundVolumes: { "brown-noise": 0.54, "focus-drone": 0.28, "keyboard-room": 0.18 } as Record<string, number>,
      favorite: true,
      isDefault: false,
    },
  ];

  return templates.map((template, index) => {
    const scene = SCENES[template.sceneIndex] ?? SCENES[0];
    return {
      id: `scene-${index}`,
      title: template.title,
      description: template.description,
      duration: scene.duration,
      tags: template.tags,
      thumbnail: scene.thumbnail,
      video: scene.video,
      favorite: template.favorite,
      isDefault: template.isDefault,
      soundIds: template.soundIds,
      soundVolumes: template.soundVolumes,
      updatedAt: now,
    };
  });
}

export function sanitizeScenes(input: unknown): SavedScene[] {
  const fallback = createDefaultScenes();
  if (!Array.isArray(input) || !input.length) {
    return fallback;
  }

  const normalized = input
    .filter((scene): scene is Partial<SavedScene> => Boolean(scene && typeof scene === "object"))
    .map((scene, index) => {
      const source = fallback[index % fallback.length];
      return {
        id: typeof scene.id === "string" ? scene.id : `scene-${index}`,
        title: typeof scene.title === "string" ? scene.title : source.title,
        description: typeof scene.description === "string" ? scene.description : source.description,
        duration: typeof scene.duration === "number" ? scene.duration : source.duration,
        tags: Array.isArray(scene.tags) ? scene.tags.filter((tag): tag is string => typeof tag === "string") : source.tags,
        thumbnail: typeof scene.thumbnail === "string" ? scene.thumbnail : source.thumbnail,
        video: typeof scene.video === "string" ? scene.video : source.video,
        favorite: typeof scene.favorite === "boolean" ? scene.favorite : source.favorite,
        isDefault: typeof scene.isDefault === "boolean" ? scene.isDefault : false,
        soundIds: Array.isArray(scene.soundIds)
          ? scene.soundIds.filter((id): id is string => typeof id === "string")
          : source.soundIds,
        soundVolumes:
          scene.soundVolumes && typeof scene.soundVolumes === "object"
            ? { ...source.soundVolumes, ...scene.soundVolumes }
            : source.soundVolumes,
        updatedAt: typeof scene.updatedAt === "number" ? scene.updatedAt : Date.now(),
      };
    });

  if (!normalized.some((scene) => scene.isDefault)) {
    normalized[0].isDefault = true;
  }

  return normalized;
}

export function createDefaultTimerPresets(scenes: SavedScene[]): TimerPreset[] {
  const fallbackSceneId = scenes[0]?.id ?? "scene-0";
  return [
    {
      id: "preset-deep-work",
      title: "Deep Work",
      desc: "Stay in the zone and get important work done.",
      focusMinutes: 50,
      breakMinutes: 10,
      sceneId: scenes.find((scene) => scene.title === "Deep Focus")?.id ?? fallbackSceneId,
      fadeOutAtEnd: true,
      breakReminders: false,
      autoStartNextSession: true,
      distractionFree: true,
    },
    {
      id: "preset-reading",
      title: "Reading",
      desc: "Quiet atmosphere for reading and comprehension.",
      focusMinutes: 35,
      breakMinutes: 8,
      sceneId: scenes.find((scene) => scene.title === "Rainy Day")?.id ?? fallbackSceneId,
      fadeOutAtEnd: false,
      breakReminders: false,
      autoStartNextSession: false,
      distractionFree: false,
    },
    {
      id: "preset-meditation",
      title: "Meditation",
      desc: "Short calm blocks with a minimal sound bed.",
      focusMinutes: 20,
      breakMinutes: 5,
      sceneId: scenes.find((scene) => scene.title === "Morning Calm")?.id ?? fallbackSceneId,
      fadeOutAtEnd: true,
      breakReminders: false,
      autoStartNextSession: false,
      distractionFree: true,
    },
    {
      id: "preset-writing",
      title: "Writing",
      desc: "Longer calm session for drafting without pressure.",
      focusMinutes: 45,
      breakMinutes: 10,
      sceneId: scenes.find((scene) => scene.title === "Night Escape")?.id ?? fallbackSceneId,
      fadeOutAtEnd: false,
      breakReminders: true,
      autoStartNextSession: true,
      distractionFree: false,
    },
  ];
}

export function sanitizeTimerPresets(input: unknown, scenes: SavedScene[]): TimerPreset[] {
  const fallback = createDefaultTimerPresets(scenes);
  if (!Array.isArray(input) || !input.length) {
    return fallback;
  }

  return input
    .filter((preset): preset is Partial<TimerPreset> => Boolean(preset && typeof preset === "object"))
    .map((preset, index) => {
      const source = fallback[index % fallback.length];
      return {
        id: typeof preset.id === "string" ? preset.id : source.id,
        title: typeof preset.title === "string" ? preset.title : source.title,
        desc: typeof preset.desc === "string" ? preset.desc : source.desc,
        focusMinutes:
          typeof preset.focusMinutes === "number" ? preset.focusMinutes : source.focusMinutes,
        breakMinutes:
          typeof preset.breakMinutes === "number" ? preset.breakMinutes : source.breakMinutes,
        sceneId: typeof preset.sceneId === "string" ? preset.sceneId : source.sceneId,
        fadeOutAtEnd:
          typeof preset.fadeOutAtEnd === "boolean" ? preset.fadeOutAtEnd : source.fadeOutAtEnd,
        breakReminders:
          typeof preset.breakReminders === "boolean"
            ? preset.breakReminders
            : source.breakReminders,
        autoStartNextSession:
          typeof preset.autoStartNextSession === "boolean"
            ? preset.autoStartNextSession
            : source.autoStartNextSession,
        distractionFree:
          typeof preset.distractionFree === "boolean"
            ? preset.distractionFree
            : source.distractionFree,
      };
    });
}

export function createDefaultTimerSession(
  presets: TimerPreset[],
  activePresetId?: string | null,
): TimerSessionState {
  const preset = presets.find((entry) => entry.id === activePresetId) ?? presets[0];
  return {
    activePresetId: preset?.id ?? null,
    phase: "focus",
    isRunning: false,
    remainingSeconds: (preset?.focusMinutes ?? 25) * 60,
    endsAt: null,
    completedCycles: 0,
    notification: null,
  };
}

export function sanitizeTimerSession(
  input: unknown,
  presets: TimerPreset[],
): TimerSessionState {
  const fallback = createDefaultTimerSession(presets);
  if (!input || typeof input !== "object") {
    return fallback;
  }

  const parsed = input as Partial<TimerSessionState>;

  return {
    activePresetId:
      typeof parsed.activePresetId === "string" || parsed.activePresetId === null
        ? parsed.activePresetId
        : fallback.activePresetId,
    phase: parsed.phase === "break" ? "break" : "focus",
    isRunning: typeof parsed.isRunning === "boolean" ? parsed.isRunning : fallback.isRunning,
    remainingSeconds:
      typeof parsed.remainingSeconds === "number"
        ? parsed.remainingSeconds
        : fallback.remainingSeconds,
    endsAt: typeof parsed.endsAt === "number" || parsed.endsAt === null ? parsed.endsAt : null,
    completedCycles:
      typeof parsed.completedCycles === "number"
        ? parsed.completedCycles
        : fallback.completedCycles,
    notification:
      typeof parsed.notification === "string" || parsed.notification === null
        ? parsed.notification
        : fallback.notification,
  };
}
