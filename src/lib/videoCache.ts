import { SCENES } from "./scenes";

let warmed = false;

export function warmSceneVideoCache() {
  if (warmed) return;
  warmed = true;

  const prefetch = () => {
    for (const scene of SCENES) {
      void fetch(scene.thumbnail, { cache: "force-cache" }).catch(() => {});
    }
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(prefetch);
    return;
  }

  globalThis.setTimeout(prefetch, 0);
}