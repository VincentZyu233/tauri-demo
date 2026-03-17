import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

interface AppInfo {
  version: string;
  name: string;
  tauri_version: string;
  start_time: number;
}

interface SystemInfo {
  os: string;
  arch: string;
  hostname: string;
  tauri_version: string;
}

interface TableItem {
  id: number;
  name: string;
  type_name: string;
  status: string;
}

interface JsonData {
  app_name: string;
  version: string;
  features: string[];
  metadata: { created_at: string; author: string; platform: string };
}

interface FontInfo {
  name: string;
  path: string;
  is_bundled: boolean;
}

type Theme = "light" | "dark" | "system";

function App() {
  const [theme, setTheme] = useState<Theme>("system");
  const [activeTab, setActiveTab] = useState("overview");
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [rustCalls, setRustCalls] = useState(0);
  const startTimeRef = useRef(Date.now());
  const [uptime, setUptime] = useState("0秒");
  
  const [greetName, setGreetName] = useState("");
  const [greetResult, setGreetResult] = useState("");
  
  const [numA, setNumA] = useState(10);
  const [numB, setNumB] = useState(20);
  const [operation, setOperation] = useState("add");
  const [calcResult, setCalcResult] = useState("");
  
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [jsonData, setJsonData] = useState<JsonData | null>(null);
  
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  
  const [fibN, setFibN] = useState(40);
  const [fibResult, setFibResult] = useState("");
  
  const [fileContent, setFileContent] = useState("");
  const [fileResult, setFileResult] = useState("");
  
  const [sliderValue, setSliderValue] = useState(50);
  const [progress, setProgress] = useState(0);
  
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);
  const toastId = useRef(0);
  
  const [bundledFonts, setBundledFonts] = useState<FontInfo[]>([]);
  const [localFonts, setLocalFonts] = useState<FontInfo[]>([]);
  const [selectedFonts, setSelectedFonts] = useState<string[]>(["LXGWWenKaiMono-Regular"]);
  const [currentFont, setCurrentFont] = useState("LXGWWenKaiMono-Regular");
  const [progressMessage, setProgressMessage] = useState("⚡ Rust 内存安全，无需 GC");

  const tauriFacts = [
    "⚡ Rust 内存安全，无需 GC",
    "📦 打包体积仅 5-10MB",
    "🔒 默认安全策略，无远程代码执行",
    "🌐 跨平台：Windows / Linux / macOS",
    "🦀 Rust 零成本抽象",
    "⚡ 启动时间 < 100ms",
    "💾 内存占用 < 30MB",
    "🔧 原生系统 API 调用",
    "🎯 接近原生性能",
    "🛡️ 防止缓冲区溢出",
    "📱 支持移动端构建",
    "🎨 灵活的前端框架选择",
    "🔄 热更新支持",
    "📊 详细的性能分析",
    "🌍 全球化应用支持",
    "🎭 多窗口管理",
    "🔗 丰富的插件生态",
    "💻 轻量级二进制",
    "🚀 快速开发迭代",
    "🔐 企业级安全标准",
    "📈 高并发处理能力",
    "🎪 无需 WebView 依赖",
    "🌟 现代化工具链",
    "💡 清晰的错误信息",
  ];

  const callRust = () => setRustCalls(c => c + 1);

  const addToast = (message: string, type: string = "info") => {
    const id = toastId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const info = await invoke<AppInfo>("get_app_info");
        setAppInfo(info);
        if (info.start_time > 0) {
          startTimeRef.current = info.start_time;
        }
      } catch {
        setAppInfo({ version: "1.0.0", name: "Tauri Demo", tauri_version: "2.x", start_time: Date.now() });
      }
    };
    loadInfo();

    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const mins = Math.floor(secs / 60);
      const hours = Math.floor(mins / 60);
      if (hours > 0) {
        setUptime(`${hours}时${mins % 60}分${secs % 60}秒`);
      } else if (mins > 0) {
        setUptime(`${mins}分${secs % 60}秒`);
      } else {
        setUptime(`${secs}秒`);
      }
      
      setProgress((prev: number) => {
        const newProgress = prev >= 100 ? 0 : prev + 8;
        if (newProgress === 0) {
          setProgressMessage(tauriFacts[Math.floor(Math.random() * tauriFacts.length)]);
        }
        return newProgress;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleGreet = async () => {
    try {
      callRust();
      const result = await invoke<string>("greet", { name: greetName || "世界" });
      setGreetResult(`✅ ${result}`);
    } catch (e) {
      setGreetResult(`❌ 错误: ${e}`);
    }
  };

  const handleCalculate = async () => {
    try {
      callRust();
      const result = await invoke<number>("calculate", { a: numA, b: numB, operation });
      setCalcResult(`✅ 结果: ${result}`);
    } catch (e) {
      setCalcResult(`❌ 错误: ${e}`);
    }
  };

  const handleLoadTable = async () => {
    try {
      callRust();
      const data = await invoke<TableItem[]>("get_table_data");
      setTableData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadJson = async () => {
    try {
      callRust();
      const data = await invoke<JsonData>("get_json_data");
      setJsonData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGetSystemInfo = async () => {
    try {
      callRust();
      const info = await invoke<SystemInfo>("get_system_info");
      setSystemInfo(info);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFibRust = async () => {
    setFibResult("⏳ Rust 计算中...");
    try {
      callRust();
      const start = performance.now();
      const result = await invoke<number>("fibonacci", { n: fibN });
      const elapsed = (performance.now() - start).toFixed(2);
      setFibResult(`✅ Rust: fib(${fibN}) = ${result} (${elapsed}ms)`);
    } catch (e) {
      setFibResult(`❌ 错误: ${e}`);
    }
  };

  const handleFibJs = () => {
    setFibResult("⏳ JS 计算中...");
    setTimeout(() => {
      const fib = (n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2);
      const start = performance.now();
      const result = fib(fibN);
      const elapsed = (performance.now() - start).toFixed(2);
      setFibResult(`✅ JS: fib(${fibN}) = ${result} (${elapsed}ms)`);
    }, 10);
  };

  const handleSaveFile = async () => {
    try {
      callRust();
      const result = await invoke<string>("save_file", { content: fileContent });
      setFileResult(`✅ ${result}`);
    } catch (e) {
      setFileResult(`❌ 错误: ${e}`);
    }
  };

  const handleReadFile = async () => {
    try {
      callRust();
      const content = await invoke<string>("read_file_content");
      setFileContent(content);
      setFileResult("✅ 文件已读取");
    } catch (e) {
      setFileResult(`❌ 错误: ${e}`);
    }
  };

  const showDialog = (type: string) => {
    if (type === "alert") {
      alert("这是一个原生 Alert 对话框！\n\n由 Tauri 应用触发。");
      setFileResult("✅ Alert 已显示");
    } else if (type === "confirm") {
      const result = confirm("你确定要执行此操作吗？");
      setFileResult(result ? "✅ 用户确认" : "❌ 用户取消");
    } else if (type === "prompt") {
      const result = prompt("请输入你的名字:", "");
      setFileResult(result ? `✅ 输入: "${result}"` : "❌ 用户取消");
    }
  };

  const loadFonts = async () => {
    try {
      callRust();
      const bundled = await invoke<FontInfo[]>("get_bundled_fonts");
      setBundledFonts(bundled);
    } catch (e) {
      console.error("加载内置字体失败:", e);
    }
  };

  const loadLocalFonts = async () => {
    try {
      callRust();
      const local = await invoke<FontInfo[]>("list_local_fonts");
      setLocalFonts(local.slice(0, 50));
    } catch (e) {
      console.error("加载本地字体失败:", e);
    }
  };

  const applyFont = (fontName: string) => {
    setCurrentFont(fontName);
    document.body.style.fontFamily = `"${fontName}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    addToast(`已切换字体: ${fontName}`, "success");
  };

  const toggleFontPriority = (fontName: string) => {
    if (selectedFonts.includes(fontName)) {
      setSelectedFonts(selectedFonts.filter(f => f !== fontName));
    } else {
      setSelectedFonts([...selectedFonts, fontName]);
    }
  };

  const tabs = [
    { id: "overview", label: "首页", icon: "🏠" },
    { id: "inputs", label: "输入", icon: "📝" },
    { id: "buttons", label: "组件", icon: "🔘" },
    { id: "data", label: "数据", icon: "📊" },
    { id: "system", label: "系统", icon: "💻" },
    { id: "files", label: "文件", icon: "📂" },
    { id: "fonts", label: "字体", icon: "🔤" },
  ];

  const themeIcon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🖥️";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">✨ Tauri</h2>
        </div>
        <nav className="sidebar-nav">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="stat-mini">
            <span className="stat-icon">⚡</span>
            <span className="stat-text">{rustCalls}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="breadcrumb">
            <span className="breadcrumb-item">{tabs.find(t => t.id === activeTab)?.label}</span>
          </div>
          <div className="top-bar-right">
            <div className="uptime-badge">
              <span className="pulse">●</span>
              <span>运行: {uptime}</span>
            </div>
            <div className="theme-toggle" onClick={() => setTheme(t => t === "light" ? "dark" : t === "dark" ? "system" : "light")}>
              <span className="theme-icon">{themeIcon}</span>
              <span className="theme-label">{theme === "light" ? "白天" : theme === "dark" ? "黑夜" : "跟随"}</span>
            </div>
          </div>
        </header>

        <div className="content">
          {activeTab === "overview" && (
            <div className="section fade-in">
              <div className="hero-card">
                <h1>欢迎使用 Tauri Demo</h1>
                <p>跨平台桌面应用 - 概念验证演示</p>
                <div className="hero-stats">
                  <div className="hero-stat">
                    <span className="hero-stat-value">{appInfo?.version || "1.0.0"}</span>
                    <span className="hero-stat-label">版本</span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-value">{appInfo?.tauri_version || "2.x"}</span>
                    <span className="hero-stat-label">Tauri</span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-value">{systemInfo?.os || "-"}</span>
                    <span className="hero-stat-label">系统</span>
                  </div>
                </div>
              </div>
              <div className="card-grid">
                <div className="card slide-up" style={{ animationDelay: "0.1s" }}>
                  <h3>🎯 技术栈</h3>
                  <ul className="feature-list">
                    <li>✅ 前端：React + TypeScript</li>
                    <li>✅ 后端：Rust (高性能、内存安全)</li>
                    <li>✅ 目标平台：Windows / Linux / macOS</li>
                    <li>✅ 打包体积：约 5-10MB</li>
                  </ul>
                </div>
                <div className="card slide-up" style={{ animationDelay: "0.2s" }}>
                  <h3>⚡ 性能</h3>
                  <div className="progress-bar">
                    <div className="progress-fill animated" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="progress-message">{progressMessage}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inputs" && (
            <div className="section fade-in">
              <div className="card slide-up">
                <h3>📝 文本输入 & Rust 交互</h3>
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="请输入姓名..." 
                    value={greetName} 
                    onChange={e => setGreetName(e.target.value)} 
                    onKeyPress={e => e.key === "Enter" && handleGreet()} 
                    className="animated-input"
                  />
                  <button className="btn btn-primary" onClick={handleGreet}>调用 Rust 问候</button>
                </div>
                <div className="result-box">{greetResult}</div>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.1s" }}>
                <h3>🧮 数值计算 (Rust 后端)</h3>
                <div className="form-row">
                  <input type="number" value={numA} onChange={e => setNumA(Number(e.target.value))} className="animated-input" />
                  <select value={operation} onChange={e => setOperation(e.target.value)}>
                    <option value="add">+</option>
                    <option value="subtract">-</option>
                    <option value="multiply">×</option>
                    <option value="divide">÷</option>
                  </select>
                  <input type="number" value={numB} onChange={e => setNumB(Number(e.target.value))} className="animated-input" />
                </div>
                <button className="btn btn-primary" onClick={handleCalculate}>计算</button>
                <div className="result-box">{calcResult}</div>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.2s" }}>
                <h3>🎚️ 其他输入类型</h3>
                <div className="form-group">
                  <label>滑块: {sliderValue}</label>
                  <input type="range" min="0" max="100" value={sliderValue} onChange={e => setSliderValue(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>日期: <input type="date" /></label>
                </div>
                <div className="form-group">
                  <label>颜色: <input type="color" defaultValue="#4a90d9" /></label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "buttons" && (
            <div className="section fade-in">
              <div className="card slide-up">
                <h3>🔘 按钮样式</h3>
                <div className="btn-group">
                  <button className="btn btn-primary">主要</button>
                  <button className="btn btn-secondary">次要</button>
                  <button className="btn btn-success">成功</button>
                  <button className="btn btn-warning">警告</button>
                  <button className="btn btn-danger">危险</button>
                  <button className="btn btn-outline">轮廓</button>
                  <button disabled>禁用</button>
                </div>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.1s" }}>
                <h3>💬 对话框 & 通知</h3>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => showDialog("alert")}>Alert</button>
                  <button className="btn btn-secondary" onClick={() => showDialog("confirm")}>Confirm</button>
                  <button className="btn btn-outline" onClick={() => showDialog("prompt")}>Prompt</button>
                </div>
                <div className="result-box">{fileResult}</div>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.2s" }}>
                <h3>📊 进度指示器</h3>
                <div className="progress-bar">
                  <div className="progress-fill animated" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.3s" }}>
                <h3>🔔 Toast 通知</h3>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => addToast("这是信息提示", "info")}>Info</button>
                  <button className="btn btn-success" onClick={() => addToast("操作成功!", "success")}>Success</button>
                  <button className="btn btn-warning" onClick={() => addToast("警告信息", "warning")}>Warning</button>
                  <button className="btn btn-danger" onClick={() => addToast("错误信息", "error")}>Error</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="section fade-in">
              <div className="card slide-up">
                <h3>📋 表格数据 (从 Rust 获取)</h3>
                <button className="btn btn-primary" onClick={handleLoadTable}>加载数据</button>
                <table className="data-table">
                  <thead><tr><th>ID</th><th>名称</th><th>类型</th><th>状态</th></tr></thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr><td colSpan={4}>点击按钮加载数据...</td></tr>
                    ) : (
                      tableData.map(item => (
                        <tr key={item.id} className="slide-up">
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{item.type_name}</td>
                          <td><span className={`status-badge ${item.status}`}>{item.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.1s" }}>
                <h3>📄 JSON 数据展示</h3>
                <button className="btn btn-primary" onClick={handleLoadJson}>获取 JSON</button>
                <pre className="json-display">{jsonData ? JSON.stringify(jsonData, null, 2) : "{ \"message\": \"点击按钮获取数据\" }"}</pre>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="section fade-in">
              <div className="card slide-up">
                <h3>💻 系统信息 (Rust 获取)</h3>
                <button className="btn btn-primary" onClick={handleGetSystemInfo}>获取系统信息</button>
                {systemInfo && (
                  <div className="info-grid">
                    <div className="info-item"><span className="label">操作系统</span><span className="value">{systemInfo.os}</span></div>
                    <div className="info-item"><span className="label">架构</span><span className="value">{systemInfo.arch}</span></div>
                    <div className="info-item"><span className="label">主机名</span><span className="value">{systemInfo.hostname}</span></div>
                    <div className="info-item"><span className="label">Tauri 版本</span><span className="value">{systemInfo.tauri_version}</span></div>
                  </div>
                )}
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.1s" }}>
                <h3>⚡ 性能测试 (斐波那契)</h3>
                <div className="form-group">
                  <label>fib(n) n = </label>
                  <input type="number" value={fibN} onChange={e => setFibN(Number(e.target.value))} min="1" max="45" style={{ width: "80px" }} className="animated-input" />
                </div>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={handleFibRust}>Rust 计算</button>
                  <button className="btn btn-secondary" onClick={handleFibJs}>JS 计算</button>
                </div>
                <div className="result-box">{fibResult}</div>
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="section fade-in">
              <div className="card slide-up">
                <h3>💾 读写文件 (Rust fs)</h3>
                <textarea value={fileContent} onChange={e => setFileContent(e.target.value)} placeholder="输入要保存的内容..." rows={4} className="animated-input" />
                <p className="char-count">已输入 {fileContent.length} 字符</p>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={handleSaveFile}>保存文件</button>
                  <button className="btn btn-secondary" onClick={handleReadFile}>读取文件</button>
                </div>
                <div className="result-box">{fileResult}</div>
              </div>
            </div>
          )}

          {activeTab === "fonts" && (
            <div className="section fade-in">
              <div className="card slide-up">
                <h3>📦 内置字体 (已打包)</h3>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={loadFonts}>加载内置字体</button>
                </div>
                <div className="font-list">
                  {bundledFonts.length === 0 ? (
                    <p className="hint">点击按钮加载内置字体</p>
                  ) : (
                    bundledFonts.map(font => (
                      <div key={font.name} className={`font-item ${currentFont === font.name ? "active" : ""}`}>
                        <span className="font-name" style={{ fontFamily: font.name }}>{font.name}</span>
                        <div className="font-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => applyFont(font.name)}>应用</button>
                          <button className={`btn ${selectedFonts.includes(font.name) ? "btn-success" : "btn-outline"} btn-sm`} onClick={() => toggleFontPriority(font.name)}>
                            {selectedFonts.includes(font.name) ? "✓ 优先" : "+ 优先"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.1s" }}>
                <h3>🔍 本地字体 (系统字体)</h3>
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={loadLocalFonts}>扫描本地字体</button>
                </div>
                <div className="font-list">
                  {localFonts.length === 0 ? (
                    <p className="hint">点击按钮扫描系统字体</p>
                  ) : (
                    localFonts.map(font => (
                      <div key={font.name} className={`font-item ${currentFont === font.name ? "active" : ""}`}>
                        <span className="font-name">{font.name}</span>
                        <div className="font-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => applyFont(font.name)}>应用</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="card slide-up" style={{ animationDelay: "0.2s" }}>
                <h3>⚙️ 字体优先级设置</h3>
                <p>当前优先级: {selectedFonts.join(" > ") || "未设置"}</p>
                <p className="hint">启用优先级的字体将在找不到前一个时自动回退</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} slide-in-right`}>{toast.message}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
