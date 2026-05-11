import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

type TitlebarProps = {
  minimizeToTray: boolean;
};

export function Titlebar({ minimizeToTray }: TitlebarProps) {
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
        // Non-tauri contexts can fail here.
      }
    };

    void sync();
    void appWindow
      .onResized(() => {
        void sync();
      })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        // Ignore listener failure outside Tauri.
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
      // Ignore in browser mode.
    }
  };

  const toggleMaximize = async () => {
    try {
      await appWindow.toggleMaximize();
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    } catch {
      // Ignore in browser mode.
    }
  };

  const close = async () => {
    try {
      await appWindow.close();
    } catch {
      // Ignore in browser mode.
    }
  };

  return (
    <header
      data-tauri-drag-region
      className="select-none border-b backdrop-blur themed-card"
      onDoubleClick={toggleMaximize}
    >
      <div data-tauri-drag-region className="flex h-11 w-full items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full themed-btn-primary" />
          <div className="h-2.5 w-2.5 rounded-full border themed-card" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">
            Oceanic
          </p>
          <nav className="ml-4 flex items-center gap-2" data-tauri-drag-region="false">
            <NavLink to="/" className={({ isActive }) => `rounded-md px-2 py-1 text-xs font-semibold ${isActive ? "themed-btn-primary" : "themed-btn-ghost border"}`}>Mixer</NavLink>
            <NavLink to="/settings" className={({ isActive }) => `rounded-md px-2 py-1 text-xs font-semibold ${isActive ? "themed-btn-primary" : "themed-btn-ghost border"}`}>Settings</NavLink>
          </nav>
        </div>

        <div className="flex items-center" data-tauri-drag-region="false">
          <button
            type="button"
            onClick={minimize}
            className="h-8 w-10 rounded-md border themed-btn-ghost transition"
            title={minimizeToTray ? "Hide to tray" : "Minimize"}
            aria-label={minimizeToTray ? "Hide to tray" : "Minimize"}
          >
            <span className="mx-auto block h-[1.5px] w-4 bg-current" />
          </button>

          <button
            type="button"
            onClick={toggleMaximize}
            className="ml-1 h-8 w-10 rounded-md border themed-btn-ghost transition"
            title={isMaximized ? "Restore" : "Maximize"}
            aria-label={isMaximized ? "Restore" : "Maximize"}
          >
            <span className="mx-auto block h-3.5 w-3.5 border border-current" />
          </button>

          <button
            type="button"
            onClick={close}
            className="ml-1 h-8 w-10 rounded-md border themed-btn-ghost transition hover:bg-red-500 hover:text-white"
            title={minimizeToTray ? "Close to tray" : "Close"}
            aria-label={minimizeToTray ? "Close to tray" : "Close"}
          >
            <span className="relative mx-auto block h-4 w-4">
              <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Titlebar;
