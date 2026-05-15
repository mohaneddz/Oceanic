use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::image::Image;
use tauri::menu::MenuBuilder;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, State, WindowEvent};

const AUTOSTART_ARG: &str = "--autostart";
const MAIN_WINDOW_LABEL: &str = "main";
const SETTINGS_FILE: &str = "oceanic-settings.json";
const TRAY_SHOW_ID: &str = "tray_show";
const TRAY_HIDE_ID: &str = "tray_hide";
const TRAY_TOGGLE_PLAYBACK_ID: &str = "tray_toggle_playback";
const TRAY_QUIT_ID: &str = "tray_quit";
const TRAY_ICON_BYTES: &[u8] = include_bytes!("../icons/32x32.png");

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AppSettings {
    minimize_to_tray: bool,
    start_minimized: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            minimize_to_tray: true,
            start_minimized: false,
        }
    }
}

#[derive(Default)]
struct AppState {
    settings: Mutex<AppSettings>,
    explicit_quit: Mutex<bool>,
}

fn is_autostart_launch() -> bool {
    std::env::args().any(|arg| arg == AUTOSTART_ARG)
}

fn settings_path(app: &AppHandle) -> Option<PathBuf> {
    let mut app_dir = app.path().app_data_dir().ok()?;
    app_dir.push(SETTINGS_FILE);
    Some(app_dir)
}

fn load_settings(app: &AppHandle) -> AppSettings {
    let Some(path) = settings_path(app) else {
        return AppSettings::default();
    };

    let Ok(raw) = fs::read_to_string(path) else {
        return AppSettings::default();
    };

    serde_json::from_str::<AppSettings>(&raw).unwrap_or_default()
}

fn persist_settings(app: &AppHandle, settings: &AppSettings) -> Result<(), String> {
    let Some(path) = settings_path(app) else {
        return Err("Failed to resolve app data path".to_string());
    };

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }

    let raw = serde_json::to_string(settings).map_err(|error| error.to_string())?;
    fs::write(path, raw).map_err(|error| error.to_string())
}

fn set_explicit_quit(app: &AppHandle, value: bool) {
    let state = app.state::<AppState>();
    if let Ok(mut explicit_quit) = state.explicit_quit.lock() {
        *explicit_quit = value;
    };
}

fn is_explicit_quit(app: &AppHandle) -> bool {
    let state = app.state::<AppState>();
    state.explicit_quit.lock().map(|value| *value).unwrap_or(false)
}

fn should_minimize_to_tray(app: &AppHandle) -> bool {
    let state = app.state::<AppState>();
    state
        .settings
        .lock()
        .map(|settings| settings.minimize_to_tray)
        .unwrap_or(false)
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn hide_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.hide();
    }
}

fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let tray_menu = MenuBuilder::new(app)
        .text(TRAY_SHOW_ID, "Show Oceanic")
        .text(TRAY_HIDE_ID, "Hide Oceanic")
        .text(TRAY_TOGGLE_PLAYBACK_ID, "Play/Pause All Sounds")
        .separator()
        .text(TRAY_QUIT_ID, "Quit")
        .build()?;

    let mut builder = TrayIconBuilder::with_id("oceanic-tray")
        .menu(&tray_menu)
        .tooltip("Oceanic")
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            TRAY_SHOW_ID => show_main_window(app),
            TRAY_HIDE_ID => hide_main_window(app),
            TRAY_TOGGLE_PLAYBACK_ID => {
                let _ = app.emit("oceanic://toggle-playback", ());
            }
            TRAY_QUIT_ID => {
                set_explicit_quit(app, true);
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button,
                button_state,
                ..
            } = event
            {
                if button == MouseButton::Left && button_state == MouseButtonState::Up {
                    show_main_window(tray.app_handle());
                }
            }
        });

    let tray_icon = Image::from_bytes(TRAY_ICON_BYTES)
        .ok()
        .or_else(|| app.default_window_icon().cloned());

    if let Some(icon) = tray_icon {
        builder = builder.icon(icon);
    }

    let _ = builder.build(app)?;
    Ok(())
}

#[tauri::command]
fn get_settings(state: State<'_, AppState>) -> AppSettings {
    state
        .settings
        .lock()
        .map(|settings| settings.clone())
        .unwrap_or_default()
}

#[tauri::command]
fn save_settings(
    app: AppHandle,
    state: State<'_, AppState>,
    settings: AppSettings,
) -> Result<(), String> {
    if let Ok(mut current) = state.settings.lock() {
        *current = settings.clone();
    }
    persist_settings(&app, &settings)
}

#[tauri::command]
fn set_hide_to_tray(app: AppHandle, state: State<'_, AppState>, enabled: bool) -> Result<(), String> {
    let updated = {
        let mut guard = state
            .settings
            .lock()
            .map_err(|_| "Failed to lock app settings".to_string())?;
        guard.minimize_to_tray = enabled;
        guard.clone()
    };
    persist_settings(&app, &updated)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin({
            #[cfg(target_os = "macos")]
            {
                tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    Some(vec![AUTOSTART_ARG]),
                )
            }
            #[cfg(not(target_os = "macos"))]
            {
                tauri_plugin_autostart::Builder::new()
                    .args([AUTOSTART_ARG])
                    .build()
            }
        })
        .setup(|app| {
            let settings = load_settings(app.handle());
            {
                let state = app.state::<AppState>();
                if let Ok(mut current) = state.settings.lock() {
                    *current = settings.clone();
                };
            }

            build_tray(app.handle())?;

            if is_autostart_launch() && settings.start_minimized {
                hide_main_window(app.handle());
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() != MAIN_WINDOW_LABEL {
                return;
            }

            if let WindowEvent::CloseRequested { api, .. } = event {
                let app = window.app_handle();
                if should_minimize_to_tray(&app) && !is_explicit_quit(&app) {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            set_hide_to_tray
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
