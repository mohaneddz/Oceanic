import type { SoundGroup } from "./types";

export const SOUND_GROUPS: SoundGroup[] = [
  {
    group: "Nature",
    sounds: [
      { id: "rain", title: "Rain", file: "/sounds/rain.ogg" },
      { id: "storm", title: "Storm", file: "/sounds/storm.ogg" },
      { id: "wind", title: "Wind", file: "/sounds/wind.ogg" },
      { id: "waves", title: "Waves", file: "/sounds/waves.ogg" },
      { id: "stream", title: "Stream", file: "/sounds/stream.ogg" },
      { id: "birds", title: "Birds", file: "/sounds/birds.ogg" },
      { id: "summer-night", title: "Summer Night", file: "/sounds/summer-night.ogg" },
    ],
  },
  {
    group: "Travel",
    sounds: [
      { id: "train", title: "Train", file: "/sounds/train.ogg" },
      { id: "boat", title: "Boat", file: "/sounds/boat.ogg" },
      { id: "city", title: "City", file: "/sounds/city.ogg" },
    ],
  },
  {
    group: "Interiors",
    sounds: [
      { id: "coffee-shop", title: "Coffee Shop", file: "/sounds/coffee-shop.ogg" },
      { id: "fireplace", title: "Fireplace", file: "/sounds/fireplace.ogg" },
    ],
  },
  {
    group: "Noise",
    sounds: [
      { id: "pink-noise", title: "Pink Noise", file: "/sounds/pink-noise.ogg" },
      { id: "white-noise", title: "White Noise", file: "/sounds/white-noise.ogg" },
    ],
  },
];

export const ALL_SOUNDS = SOUND_GROUPS.flatMap((group) => group.sounds);
