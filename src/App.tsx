import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

interface AppInfo {
  version: string;
  name: string;
  tauriVersion: string;
  startTime: number;
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

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [rustCalls, setRustCalls] = useState(0);
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState("0s");
  
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
  const [showModal, setShowModal] = useState(false);
  const [dialogResult, setDialogResult] = useState("");
  
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);
  const toastId = useRef(0);
  
  const [bundledFonts, setBundledFonts] = useState<FontInfo[]>([]);
  const [localFonts, setLocalFonts] = useState<FontInfo[]>([]);
  const [selectedFonts, setSelectedFonts] = useState<string[]>(["LXGWWenKaiMono-Regular"]);
  const [currentFont, setCurrentFont] = useState("LXGWWenKaiMono-Regular");

  const callRust = () => setRustCalls(c => c + 1);

  const addToast = (message: string, type: string = "info") => {
    const id = toastId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const info = await invoke<AppInfo>("get_app_info");
        setAppInfo(info);
      } catch {
        setAppInfo({ version: "1.0.0", name: "Tauri Demo", tauriVersion: "2.x", startTime: Date.now() });
      }
    };
    loadInfo();

    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(secs / 60);
      setUptime(mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`);
      setProgress(p => (p >= 100 ? 0 : p + 5));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

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
      setDialogResult("✅ Alert 已显示");
    } else if (type === "confirm") {
      const result = confirm("你确定要执行此操作吗？");
      setDialogResult(result ? "✅ 用户确认" : "❌ 用户取消");
    } else if (type === "prompt") {
      const result = prompt("请输入你的名字:", "");
      setDialogResult(result ? `✅ 输入: "${result}"` : "❌ 用户取消");
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
    { id: "overview", label: "📊 概览" },
    { id: "inputs", label: "📝 输入" },
    { id: "buttons", label: "🔘 按钮" },
    { id: "data", label: "📁 数据" },
    { id: "system", label: "💻 系统" },
    { id: "files", label: "📂 文件" },
    { id: "fonts", label: "🔤 字体" },
  ];

  return (
    <div className="app">
      <div className="header">
        <h1>🚀 Tauri Demo</h1>
        <p>跨平台桌面应用 - 概念验证演示</p>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value">{rustCalls}</span>
          <span className="stat-label">Rust 调用</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{uptime}</span>
          <span className="stat-label">运行时间</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{appInfo?.tauriVersion || "-"}</span>
          <span className="stat-label">Tauri 版本</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{appInfo?.version || "1.0.0"}</span>
          <span className="stat-label">应用版本</span>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <div key={tab.id} className={`tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </div>
        ))}
      </div>

      <div className="content">
        {activeTab === "overview" && (
          <div className="section fade-in">
            <div className="card">
              <h3>🎯 概念验证说明</h3>
              <p>这是一个使用 <strong>Tauri 2.0</strong> + <strong>Rust</strong> 构建的跨平台桌面应用 Demo。</p>
              <ul className="feature-list">
                <li>✅ 前端：React + TypeScript</li>
                <li>✅ 后端：Rust (高性能、内存安全)</li>
                <li>✅ 目标平台：Windows / Linux / macOS (x86 + ARM)</li>
                <li>✅ 打包体积：约 5-10MB (远小于 Electron)</li>
              </ul>
            </div>
            <div className="card">
              <h3>📊 启动信息</h3>
              <div className="info-grid">
                <div className="info-item"><span className="label">应用名称</span><span className="value">{appInfo?.name || "Tauri Demo"}</span></div>
                <div className="info-item"><span className="label">版本</span><span className="value">{appInfo?.version || "1.0.0"}</span></div>
                <div className="info-item"><span className="label">启动时间</span><span className="value">{appInfo?.startTime ? Date.now() - appInfo.startTime + "ms" : "-"}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "inputs" && (
          <div className="section fade-in">
            <div className="card">
              <h3>📝 文本输入 & Rust 交互</h3>
              <div className="form-group">
                <input type="text" placeholder="请输入姓名..." value={greetName} onChange={e => setGreetName(e.target.value)} onKeyPress={e => e.key === "Enter" && handleGreet()} />
                <button className="btn btn-primary" onClick={handleGreet}>调用 Rust 问候</button>
              </div>
              <div className="result-box">{greetResult}</div>
            </div>
            <div className="card">
              <h3>🧮 数值计算 (Rust 后端)</h3>
              <div className="form-row">
                <input type="number" value={numA} onChange={e => setNumA(Number(e.target.value))} />
                <select value={operation} onChange={e => setOperation(e.target.value)}>
                  <option value="add">+</option>
                  <option value="subtract">-</option>
                  <option value="multiply">×</option>
                  <option value="divide">÷</option>
                </select>
                <input type="number" value={numB} onChange={e => setNumB(Number(e.target.value))} />
              </div>
              <button className="btn btn-primary" onClick={handleCalculate}>计算</button>
              <div className="result-box">{calcResult}</div>
            </div>
            <div className="card">
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
            <div className="card">
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
            <div className="card">
              <h3>💬 对话框 & 通知</h3>
              <div className="btn-group">
                <button className="btn btn-primary" onClick={() => showDialog("alert")}>Alert</button>
                <button className="btn btn-secondary" onClick={() => showDialog("confirm")}>Confirm</button>
                <button className="btn btn-outline" onClick={() => showDialog("prompt")}>Prompt</button>
              </div>
              <div className="result-box">{dialogResult}</div>
            </div>
            <div className="card">
              <h3>📊 进度指示器</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>{progress}%</span>
            </div>
            <div className="card">
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
            <div className="card">
              <h3>📋 表格数据 (从 Rust 获取)</h3>
              <button className="btn btn-primary" onClick={handleLoadTable}>加载数据</button>
              <table className="data-table">
                <thead><tr><th>ID</th><th>名称</th><th>类型</th><th>状态</th></tr></thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr><td colSpan={4}>点击按钮加载数据...</td></tr>
                  ) : (
                    tableData.map(item => (
                      <tr key={item.id}>
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
            <div className="card">
              <h3>📄 JSON 数据展示</h3>
              <button className="btn btn-primary" onClick={handleLoadJson}>获取 JSON</button>
              <pre className="json-display">{jsonData ? JSON.stringify(jsonData, null, 2) : "{ \"message\": \"点击按钮获取数据\" }"}</pre>
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className="section fade-in">
            <div className="card">
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
            <div className="card">
              <h3>⚡ 性能测试 (斐波那契)</h3>
              <div className="form-group">
                <label>fib(n) n = </label>
                <input type="number" value={fibN} onChange={e => setFibN(Number(e.target.value))} min="1" max="45" style={{ width: "80px" }} />
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
            <div className="card">
              <h3>💾 读写文件 (Rust fs)</h3>
              <textarea value={fileContent} onChange={e => setFileContent(e.target.value)} placeholder="输入要保存的内容..." rows={4} />
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
            <div className="card">
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
            <div className="card">
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
            <div className="card">
              <h3>⚙️ 字体优先级设置</h3>
              <p>当前优先级: {selectedFonts.join(" &gt; ") || "未设置"}</p>
              <p className="hint">启用优先级的字体将在找不到前一个时自动回退</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>确认操作</h3>
            <p>确定要执行这个操作吗？</p>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); addToast("操作已确认!", "success"); }}>确认</button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>{toast.message}</div>
        ))}
      </div>
    </div>
  );
}

export default App;