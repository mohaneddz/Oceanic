import type { SoundDefinition, SoundGroup } from "./types";

export const SOUND_LIBRARY: SoundDefinition[] = [
  { id: "rain", title: "Rain", file: "/sounds/rain.ogg", group: "Weather", icon: "rain", defaultVolume: 0.68 },
  { id: "soft-rain", title: "Soft Rain", file: "/sounds/soft-rain.ogg", group: "Weather", icon: "rain", defaultVolume: 0.62 },
  { id: "roof-rain", title: "Roof Rain", file: "/sounds/roof-rain.ogg", group: "Weather", icon: "rain", defaultVolume: 0.66 },
  { id: "tent-rain", title: "Tent Rain", file: "/sounds/tent-rain.ogg", group: "Weather", icon: "rain", defaultVolume: 0.66 },
  { id: "storm", title: "Storm", file: "/sounds/storm.ogg", group: "Weather", icon: "storm", defaultVolume: 0.58 },
  { id: "distant-thunder", title: "Distant Thunder", file: "/sounds/distant-thunder.ogg", group: "Weather", icon: "storm", defaultVolume: 0.54 },
  { id: "wind", title: "Wind", file: "/sounds/wind.ogg", group: "Weather", icon: "wind", defaultVolume: 0.56 },
  { id: "mountain-wind", title: "Mountain Wind", file: "/sounds/mountain-wind.ogg", group: "Weather", icon: "wind", defaultVolume: 0.52 },
  { id: "leaves", title: "Rustling Leaves", file: "/sounds/leaves.ogg", group: "Weather", icon: "leaves", defaultVolume: 0.48 },

  { id: "waves", title: "Waves", file: "/sounds/waves.ogg", group: "Water", icon: "waves", defaultVolume: 0.68 },
  { id: "deep-waves", title: "Deep Waves", file: "/sounds/deep-waves.ogg", group: "Water", icon: "waves", defaultVolume: 0.62 },
  { id: "harbor-water", title: "Harbor Water", file: "/sounds/harbor-water.ogg", group: "Water", icon: "boat", defaultVolume: 0.55 },
  { id: "stream", title: "Stream", file: "/sounds/stream.ogg", group: "Water", icon: "stream", defaultVolume: 0.62 },
  { id: "waterfall", title: "Waterfall", file: "/sounds/waterfall.ogg", group: "Water", icon: "stream", defaultVolume: 0.58 },
  { id: "droplets", title: "Droplets", file: "/sounds/droplets.ogg", group: "Water", icon: "stream", defaultVolume: 0.44 },

  { id: "birds", title: "Birds", file: "/sounds/birds.ogg", group: "Forest", icon: "birds", defaultVolume: 0.5 },
  { id: "forest-dawn", title: "Forest Dawn", file: "/sounds/forest-dawn.ogg", group: "Forest", icon: "birds", defaultVolume: 0.54 },
  { id: "meadow-birds", title: "Meadow Birds", file: "/sounds/meadow-birds.ogg", group: "Forest", icon: "birds", defaultVolume: 0.48 },
  { id: "summer-night", title: "Summer Night", file: "/sounds/summer-night.ogg", group: "Forest", icon: "night", defaultVolume: 0.56 },
  { id: "crickets", title: "Crickets", file: "/sounds/crickets.ogg", group: "Forest", icon: "night", defaultVolume: 0.48 },
  { id: "frogs", title: "Frogs", file: "/sounds/frogs.ogg", group: "Forest", icon: "night", defaultVolume: 0.46 },
  { id: "owl-night", title: "Owl Night", file: "/sounds/owl-night.ogg", group: "Forest", icon: "night", defaultVolume: 0.4 },

  { id: "train", title: "Train", file: "/sounds/train.ogg", group: "Travel", icon: "train", defaultVolume: 0.58 },
  { id: "train-carriage", title: "Train Carriage", file: "/sounds/train-carriage.ogg", group: "Travel", icon: "train", defaultVolume: 0.54 },
  { id: "subway", title: "Subway", file: "/sounds/subway.ogg", group: "Travel", icon: "train", defaultVolume: 0.52 },
  { id: "boat", title: "Boat", file: "/sounds/boat.ogg", group: "Travel", icon: "boat", defaultVolume: 0.5 },
  { id: "cabin-engine", title: "Cabin Engine", file: "/sounds/cabin-engine.ogg", group: "Travel", icon: "plane", defaultVolume: 0.45 },
  { id: "airplane-cabin", title: "Airplane Cabin", file: "/sounds/airplane-cabin.ogg", group: "Travel", icon: "plane", defaultVolume: 0.46 },

  { id: "city", title: "City", file: "/sounds/city.ogg", group: "Urban", icon: "city", defaultVolume: 0.46 },
  { id: "downtown-night", title: "Downtown Night", file: "/sounds/downtown-night.ogg", group: "Urban", icon: "city", defaultVolume: 0.44 },
  { id: "harbor-city", title: "Harbor City", file: "/sounds/harbor-city.ogg", group: "Urban", icon: "city", defaultVolume: 0.42 },
  { id: "library", title: "Library", file: "/sounds/library.ogg", group: "Urban", icon: "city", defaultVolume: 0.34 },

  { id: "coffee-shop", title: "Coffee Shop", file: "/sounds/coffee-shop.ogg", group: "Interiors", icon: "coffee", defaultVolume: 0.44 },
  { id: "fireplace", title: "Fireplace", file: "/sounds/fireplace.ogg", group: "Interiors", icon: "fireplace", defaultVolume: 0.54 },
  { id: "campfire", title: "Campfire", file: "/sounds/campfire.ogg", group: "Interiors", icon: "camp", defaultVolume: 0.5 },
  { id: "keyboard-room", title: "Keyboard Room", file: "/sounds/keyboard-room.ogg", group: "Interiors", icon: "coffee", defaultVolume: 0.3 },
  { id: "fan", title: "Fan", file: "/sounds/fan.ogg", group: "Interiors", icon: "fan", defaultVolume: 0.42 },

  { id: "pink-noise", title: "Pink Noise", file: "/sounds/pink-noise.ogg", group: "Focus", icon: "noise", defaultVolume: 0.45 },
  { id: "white-noise", title: "White Noise", file: "/sounds/white-noise.ogg", group: "Focus", icon: "noise", defaultVolume: 0.42 },
  { id: "brown-noise", title: "Brown Noise", file: "/sounds/brown-noise.ogg", group: "Focus", icon: "noise", defaultVolume: 0.5 },
  { id: "grey-noise", title: "Grey Noise", file: "/sounds/grey-noise.ogg", group: "Focus", icon: "noise", defaultVolume: 0.42 },
  { id: "low-hum", title: "Low Hum", file: "/sounds/low-hum.ogg", group: "Focus", icon: "noise", defaultVolume: 0.38 },
  { id: "focus-drone", title: "Focus Drone", file: "/sounds/focus-drone.ogg", group: "Focus", icon: "noise", defaultVolume: 0.34 },
];

export const SOUND_GROUPS: SoundGroup[] = Array.from(
  SOUND_LIBRARY.reduce((groups, sound) => {
    const entry = groups.get(sound.group);
    if (entry) {
      entry.push(sound);
    } else {
      groups.set(sound.group, [sound]);
    }
    return groups;
  }, new Map<string, SoundDefinition[]>()),
).map(([group, sounds]) => ({ group, sounds }));

export const ALL_SOUNDS = SOUND_LIBRARY;
