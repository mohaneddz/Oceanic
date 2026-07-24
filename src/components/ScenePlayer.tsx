import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { SavedScene } from "../lib/types";

interface ScenePlayerProps {
  scene: Pick<SavedScene, "title" | "description" | "video">;
  onClose: () => void;
}

export function ScenePlayer({ scene, onClose }: ScenePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let disposed = false;

    const enterFullscreen = async () => {
      try {
        const win = getCurrentWindow();
        if (!disposed && !(await win.isFullscreen())) {
          await win.setFullscreen(true);
        }
      } catch (err) {
        console.warn("Fullscreen entry failed:", err);
      }
    };

    void enterFullscreen();

    return () => {
      disposed = true;
      void (async () => {
        try {
          const win = getCurrentWindow();
          if (await win.isFullscreen()) {
            await win.setFullscreen(false);
          }
        } catch (err) {
          console.warn("Fullscreen exit failed:", err);
        }
      })();
    };
  }, []);

  // Play/pause and source sync effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        console.warn("Video playback start failed:", err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, scene.video]);

  // Auto-play when changing scenes
  useEffect(() => {
    setIsPlaying(true);
  }, [scene.video]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <video
        ref={videoRef}
        src={scene.video}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay={isPlaying}
        loop
        muted={isMuted}
        playsInline
        preload="auto"
      />
      
      <div className="absolute inset-x-0 bottom-0 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-6 sm:p-8">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white drop-shadow-md">{scene.title}</h2>
          <p className="mt-1 text-sm text-white/80 drop-shadow-md">{scene.description}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
          <button
            onClick={async () => {
              try {
                const win = getCurrentWindow();
                const isFull = await win.isFullscreen();
                await win.setFullscreen(!isFull);
              } catch (err) {
                console.error("Fullscreen toggle failed:", err);
              }
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
            aria-label="Toggle Fullscreen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
          </button>
        </div>
      </div>

      <button
        onClick={async () => {
          try {
            const win = getCurrentWindow();
            if (await win.isFullscreen()) {
              await win.setFullscreen(false);
            }
          } catch (err) {
            console.error("Failed to exit fullscreen:", err);
          }
          onClose();
        }}
        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 z-10"
        aria-label="Close player"
      >
        <X size={20} />
      </button>

      {/* Adding -webkit-app-region: no-drag for titlebar scenarios if applicable */}
      <div className="absolute inset-x-0 top-0 h-8" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} />
    </div>
  );
}
