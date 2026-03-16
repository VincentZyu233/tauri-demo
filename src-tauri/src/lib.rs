use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::env;

#[derive(Serialize, Deserialize)]
pub struct TableItem {
    id: u32,
    name: String,
    type_name: String,
    status: String,
}

#[derive(Serialize, Deserialize)]
pub struct SystemInfo {
    os: String,
    arch: String,
    hostname: String,
    tauri_version: String,
}

#[derive(Serialize, Deserialize)]
pub struct JsonData {
    app_name: String,
    version: String,
    features: Vec<String>,
    metadata: Metadata,
}

#[derive(Serialize, Deserialize)]
pub struct Metadata {
    created_at: String,
    author: String,
    platform: String,
}

#[derive(Serialize, Deserialize)]
pub struct FileEntry {
    name: String,
    is_dir: bool,
    size: u64,
}

#[derive(Serialize, Deserialize)]
pub struct FontInfo {
    name: String,
    path: String,
    is_bundled: bool,
}

#[derive(Serialize, Deserialize)]
pub struct AppInfo {
    pub version: String,
    pub name: String,
    pub tauri_version: String,
    #[serde(rename = "startTime")]
    pub start_time: u64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("你好, {}! 这条消息来自 Rust 后端! 🦀", name)
}

#[tauri::command]
fn calculate(a: f64, b: f64, operation: &str) -> Result<f64, String> {
    match operation {
        "add" => Ok(a + b),
        "subtract" => Ok(a - b),
        "multiply" => Ok(a * b),
        "divide" => {
            if b == 0.0 {
                Err("除数不能为零!".to_string())
            } else {
                Ok(a / b)
            }
        }
        _ => Err(format!("未知操作: {}", operation)),
    }
}

#[tauri::command]
fn simulate_work(progress: u32) -> String {
    std::thread::sleep(std::time::Duration::from_millis(50));
    format!("进度: {}%", progress)
}

#[tauri::command]
fn get_table_data() -> Vec<TableItem> {
    vec![
        TableItem { id: 1, name: "Tauri 核心".to_string(), type_name: "框架".to_string(), status: "active".to_string() },
        TableItem { id: 2, name: "Rust 后端".to_string(), type_name: "语言".to_string(), status: "active".to_string() },
        TableItem { id: 3, name: "WebView".to_string(), type_name: "渲染器".to_string(), status: "active".to_string() },
        TableItem { id: 4, name: "跨平台编译".to_string(), type_name: "功能".to_string(), status: "pending".to_string() },
        TableItem { id: 5, name: "移动端支持".to_string(), type_name: "功能".to_string(), status: "inactive".to_string() },
    ]
}

#[tauri::command]
fn get_json_data() -> JsonData {
    JsonData {
        app_name: "Tauri Demo".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        features: vec![
            "跨平台桌面应用".to_string(),
            "Rust 高性能后端".to_string(),
            "原生系统集成".to_string(),
            "小体积打包".to_string(),
            "WebView 前端".to_string(),
        ],
        metadata: Metadata {
            created_at: chrono_lite_now(),
            author: "Your Team".to_string(),
            platform: get_platform_string(),
        },
    }
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        hostname: hostname::get()
            .map(|h| h.to_string_lossy().to_string())
            .unwrap_or_else(|_| "Unknown".to_string()),
        tauri_version: "2.x".to_string(),
    }
}

#[tauri::command]
fn get_app_info() -> AppInfo {
    AppInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        name: env!("CARGO_PKG_NAME").to_string(),
        tauri_version: env!("CARGO_PKG_VERSION").to_string(),
        start_time: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64,
    }
}

#[tauri::command]
fn fibonacci(n: u32) -> u64 {
    fn fib(n: u32) -> u64 {
        if n <= 1 { n as u64 } else { fib(n - 1) + fib(n - 2) }
    }
    fib(n)
}

#[tauri::command]
fn save_file(content: &str) -> Result<String, String> {
    let path = get_demo_file_path();
    fs::write(&path, content).map_err(|e| format!("写入失败: {}", e))?;
    Ok(format!("文件已保存到: {}", path.display()))
}

#[tauri::command]
fn read_file_content() -> Result<String, String> {
    let path = get_demo_file_path();
    fs::read_to_string(&path).map_err(|e| format!("读取失败: {}", e))
}

#[tauri::command]
fn list_directory() -> Result<Vec<FileEntry>, String> {
    let current_dir = env::current_dir().map_err(|e| format!("获取目录失败: {}", e))?;
    let entries: Vec<FileEntry> = fs::read_dir(&current_dir)
        .map_err(|e| format!("读取目录失败: {}", e))?
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let metadata = e.metadata().ok()?;
                Some(FileEntry {
                    name: e.file_name().to_string_lossy().to_string(),
                    is_dir: metadata.is_dir(),
                    size: metadata.len(),
                })
            })
        })
        .collect();
    Ok(entries)
}

fn get_resource_fonts_path() -> PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
        .join("fonts")
}

#[tauri::command]
fn get_bundled_fonts() -> Vec<FontInfo> {
    let fonts_dir = get_resource_fonts_path();
    let mut fonts = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&fonts_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(ext) = path.extension() {
                if ext == "ttf" || ext == "otf" || ext == "woff" || ext == "woff2" {
                    if let Some(name) = path.file_stem() {
                        fonts.push(FontInfo {
                            name: name.to_string_lossy().to_string(),
                            path: path.to_string_lossy().to_string(),
                            is_bundled: true,
                        });
                    }
                }
            }
        }
    }
    fonts
}

#[tauri::command]
fn get_font_path(font_name: &str) -> Result<String, String> {
    let fonts_dir = get_resource_fonts_path();
    let font_path = fonts_dir.join(format!("{}.ttf", font_name));
    
    if font_path.exists() {
        Ok(font_path.to_string_lossy().to_string())
    } else {
        let otf_path = fonts_dir.join(format!("{}.otf", font_name));
        if otf_path.exists() {
            Ok(otf_path.to_string_lossy().to_string())
        } else {
            Err(format!("字体文件不存在: {}", font_name))
        }
    }
}

#[tauri::command]
fn list_local_fonts() -> Vec<FontInfo> {
    let mut fonts = Vec::new();
    
    #[cfg(target_os = "windows")]
    {
        let mut font_dirs: Vec<Option<PathBuf>> = vec![
            env::var("WINDIR").ok().map(|w| PathBuf::from(w).join("Fonts")),
            env::var("LOCALAPPDATA").ok().map(|l| PathBuf::from(l).join("Microsoft").join("Windows").join("Fonts")),
        ];
        
        for opt_dir in font_dirs.into_iter().flatten() {
            if let Ok(entries) = fs::read_dir(&opt_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if let Some(ext) = path.extension() {
                        if ext == "ttf" || ext == "otf" {
                            if let Some(name) = path.file_stem() {
                                let name_str = name.to_string_lossy().to_string();
                                if !fonts.iter().any(|f: &FontInfo| f.name == name_str) {
                                    fonts.push(FontInfo {
                                        name: name_str,
                                        path: path.to_string_lossy().to_string(),
                                        is_bundled: false,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        let mut font_dirs = vec![
            PathBuf::from("/System/Library/Fonts"),
            PathBuf::from("/Library/Fonts"),
        ];
        
        if let Some(home) = dirs::home_dir() {
            font_dirs.push(home.join("Library/Fonts"));
        }
        
        for dir in font_dirs {
            if let Ok(entries) = fs::read_dir(&dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if let Some(ext) = path.extension() {
                        if ext == "ttf" || ext == "otf" {
                            if let Some(name) = path.file_stem() {
                                let name_str = name.to_string_lossy().to_string();
                                if !fonts.iter().any(|f: &FontInfo| f.name == name_str) {
                                    fonts.push(FontInfo {
                                        name: name_str,
                                        path: path.to_string_lossy().to_string(),
                                        is_bundled: false,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        let mut font_dirs = vec![
            PathBuf::from("/usr/share/fonts"),
            PathBuf::from("/usr/local/share/fonts"),
        ];
        
        if let Some(home) = dirs::home_dir() {
            font_dirs.push(home.join(".fonts"));
            font_dirs.push(home.join(".local/share/fonts"));
        }
        
        for dir in font_dirs {
            if let Ok(entries) = fs::read_dir(&dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_dir() {
                        if let Ok(sub_entries) = fs::read_dir(&path) {
                            for sub_entry in sub_entries.flatten() {
                                let sub_path = sub_entry.path();
                                if let Some(ext) = sub_path.extension() {
                                    if ext == "ttf" || ext == "otf" {
                                        if let Some(name) = sub_path.file_stem() {
                                            let name_str = name.to_string_lossy().to_string();
                                            if !fonts.iter().any(|f: &FontInfo| f.name == name_str) {
                                                fonts.push(FontInfo {
                                                    name: name_str,
                                                    path: sub_path.to_string_lossy().to_string(),
                                                    is_bundled: false,
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    fonts
}

fn get_demo_file_path() -> PathBuf {
    let mut path = env::temp_dir();
    path.push("tauri_demo_file.txt");
    path
}

fn get_platform_string() -> String {
    format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH)
}

fn chrono_lite_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let secs = duration.as_secs();
    let days = secs / 86400;
    let years = 1970 + days / 365;
    let remaining_days = days % 365;
    let month = remaining_days / 30 + 1;
    let day = remaining_days % 30 + 1;
    format!("{:04}-{:02}-{:02}T00:00:00Z", years, month, day)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            calculate,
            simulate_work,
            get_table_data,
            get_json_data,
            get_system_info,
            get_app_info,
            fibonacci,
            save_file,
            read_file_content,
            list_directory,
            get_bundled_fonts,
            get_font_path,
            list_local_fonts,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}