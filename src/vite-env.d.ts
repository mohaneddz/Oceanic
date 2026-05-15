/// <reference types="vite/client" />

declare module "@tauri-apps/plugin-autostart" {
  export function enable(): Promise<void>;
  export function disable(): Promise<void>;
  export function isEnabled(): Promise<boolean>;
}

declare module "@tauri-apps/plugin-store" {
  export type Store = {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<void>;
    save(): Promise<void>;
    close(): Promise<void>;
  };
  export function load(path: string, options?: { defaults?: object; autoSave?: number }): Promise<Store>;
}

declare module "react-router-dom" {
  import type { ReactNode } from "react";
  export function BrowserRouter(props: { children: ReactNode }): JSX.Element;
  export function Routes(props: { children: ReactNode }): JSX.Element;
  export function Route(props: { path: string; element: JSX.Element }): JSX.Element;
  export function Navigate(props: { to: string; replace?: boolean }): JSX.Element;
  export function NavLink(props: {
    to: string;
    children: ReactNode;
    className?: string | ((args: { isActive: boolean }) => string);
  }): JSX.Element;
  export function Link(props: {
    to: string;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }): JSX.Element;
}
