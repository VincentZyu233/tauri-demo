use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::env;

// ==================== 数据结构 ====================
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

// ==================== Tauri 命令 ====================

/// 问候命令
#[tauri::command]
fn greet(name: &str) -> String {
    format!("你好, {}! 这条消息来自 Rust 后端! 🦀", name)
}

/// 数学计算命令
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

/// 模拟工作进度
#[tauri::command]
fn simulate_work(progress: u32) -> String {
    // 模拟一些工作
    std::thread::sleep(std::time::Duration::from_millis(50));
    format!("进度: {}%", progress)
}

/// 获取表格数据
#[tauri::command]
fn get_table_data() -> Vec<TableItem> {
    vec![
        TableItem {
            id: 1,
            name: "Tauri 核心".to_string(),
            type_name: "框架".to_string(),
            status: "active".to_string(),
        },
        TableItem {
            id: 2,
            name: "Rust 后端".to_string(),
            type_name: "语言".to_string(),
            status: "active".to_string(),
        },
        TableItem {
            id: 3,
            name: "WebView".to_string(),
            type_name: "渲染器".to_string(),
            status: "active".to_string(),
        },
        TableItem {
            id: 4,
            name: "跨平台编译".to_string(),
            type_name: "功能".to_string(),
            status: "pending".to_string(),
        },
        TableItem {
            id: 5,
            name: "移动端支持".to_string(),
            type_name: "功能".to_string(),
            status: "inactive".to_string(),
        },
    ]
}

/// 获取 JSON 数据
#[tauri::command]
fn get_json_data() -> JsonData {
    JsonData {
        app_name: "Tauri Demo".to_string(),
        version: "0.1.0".to_string(),
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

/// 获取系统信息
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

/// 斐波那契计算 (用于性能测试)
#[tauri::command]
fn fibonacci(n: u32) -> u64 {
    fn fib(n: u32) -> u64 {
        if n <= 1 {
            n as u64
        } else {
            fib(n - 1) + fib(n - 2)
        }
    }
    fib(n)
}

/// 保存文件
#[tauri::command]
fn save_file(content: &str) -> Result<String, String> {
    let path = get_demo_file_path();
    fs::write(&path, content).map_err(|e| format!("写入失败: {}", e))?;
    Ok(format!("文件已保存到: {}", path.display()))
}

/// 读取文件
#[tauri::command]
fn read_file_content() -> Result<String, String> {
    let path = get_demo_file_path();
    fs::read_to_string(&path).map_err(|e| format!("读取失败: {}", e))
}

/// 列出目录
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

// ==================== 辅助函数 ====================

fn get_demo_file_path() -> PathBuf {
    let mut path = env::temp_dir();
    path.push("tauri_demo_file.txt");
    path
}

fn get_platform_string() -> String {
    format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH)
}

fn chrono_lite_now() -> String {
    // 简单的时间戳,不依赖 chrono
    "2024-12-22T00:00:00Z".to_string()
}

// ==================== 应用入口 ====================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            calculate,
            simulate_work,
            get_table_data,
            get_json_data,
            get_system_info,
            fibonacci,
            save_file,
            read_file_content,
            list_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
