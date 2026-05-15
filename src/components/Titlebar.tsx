import { getCurrentWindow } from "@tauri-apps/api/window";
import { AudioLines } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

type TitlebarProps = {
  minimizeToTray: boolean;
  playbackText: string;
};

const NAV_ITEMS = [
  { to: "/", label: "Mixer" },
  { to: "/scenes", label: "Scenes" },
  { to: "/timer", label: "Timer" },
  { to: "/settings", label: "Settings" },
];

export function Titlebar({ minimizeToTray, playbackText }: TitlebarProps) {
  const appWindow = useMemo(() => getCurrentWindow(), []);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | null = null;

    const sync = async () => {
      try {
        const maximized = await appWindow.isMaximized();
        if (!disposed) {
          setIsMaximized(maximized);
        }
      } catch {
        // noop for web-only preview
      }
    };

    void sync();
    void appWindow
      .onResized(() => {
        void sync();
      })
      .then((off) => {
        unlisten = off;
      })
      .catch(() => {
        // noop for web-only preview
      });

    return () => {
      disposed = true;
      if (unlisten) {
        unlisten();
      }
    };
  }, [appWindow]);

  const minimize = async () => {
    try {
      if (minimizeToTray) {
        await appWindow.hide();
      } else {
        await appWindow.minimize();
      }
    } catch {
      // noop for web-only preview
    }
  };

  const toggleMaximize = async () => {
    try {
      await appWindow.toggleMaximize();
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    } catch {
      // noop for web-only preview
    }
  };

  const close = async () => {
    try {
      await appWindow.close();
    } catch {
      // noop for web-only preview
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="h-[62px] border-b border-[#6c9dd633] bg-gradient-to-b from-[#08192cf5] to-[#051322f2]"
      onDoubleClick={toggleMaximize}
    >
      <div
        data-tauri-drag-region
        className="flex h-full items-center justify-between px-4"
      >
        <div className="flex items-center gap-4">
          <img src="/images/brand/logo.png" alt="Oceanic" className="h-[22px] w-auto opacity-95" />
          <nav className="flex items-center gap-1" data-tauri-drag-region="false">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-[10px] border px-4 py-3 text-[17px] font-semibold leading-none transition ${
                    isActive
                      ? "border-[#6091c766] bg-gradient-to-b from-[#1c4571db] to-[#133151e0] text-white"
                      : "border-transparent text-[#e2ecf7d6] hover:border-[#7099ca57] hover:bg-[#122f508c] hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3" data-tauri-drag-region="false">
          <div className="flex items-center gap-2 text-[16px] text-[#d6e1f0]">
            <span className={`h-2 w-2 rounded-full shadow-[0_0_0_3px_rgba(45,132,255,0.2)] ${playbackText === "Paused" ? "bg-[#8aa2bc]" : "bg-[#2d84ff]"}`} />
            <span>{playbackText === "Paused" ? "Paused" : "Currently Playing"}</span>
            <AudioLines size={16} />
          </div>
          <span className="h-5 w-px bg-[#7099ca40]" />
          <div className="flex items-center gap-[2px]">
            <button
              type="button"
              className="inline-flex h-7 w-[34px] items-center justify-center rounded-lg border border-transparent bg-transparent text-[#d9e7fa] hover:border-[#6392ca61] hover:bg-[#14355899]"
              aria-label="Minimize"
              onClick={minimize}
            >
              <span className="block h-[1px] w-4 bg-current" />
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-[34px] items-center justify-center rounded-lg border border-transparent bg-transparent text-[#d9e7fa] hover:border-[#6392ca61] hover:bg-[#14355899]"
              aria-label={isMaximized ? "Restore" : "Maximize"}
              onClick={toggleMaximize}
            >
              {isMaximized ? (
                <span className="relative block h-[10px] w-[10px]">
                  <span className="absolute right-0 top-0 h-[8px] w-[8px] border border-current bg-transparent" />
                  <span className="absolute bottom-0 left-0 h-[8px] w-[8px] border border-current bg-transparent" />
                </span>
              ) : (
                <span className="block h-[10px] w-[10px] border border-current" />
              )}
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-[34px] items-center justify-center rounded-lg border border-transparent bg-transparent text-[#d9e7fa] hover:border-[#6392ca61] hover:bg-[#14355899]"
              aria-label="Close"
              onClick={close}
            >
              <span className="relative block h-[10px] w-[10px]">
                <span className="absolute left-0 top-1/2 h-[1px] w-[10px] -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-0 top-1/2 h-[1px] w-[10px] -translate-y-1/2 -rotate-45 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Titlebar;
