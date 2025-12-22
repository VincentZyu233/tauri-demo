const { invoke } = window.__TAURI__.core;

// 全局状态
let rustCallCount = 0;
let startTime = Date.now();

// 更新 Rust 调用计数
function incrementRustCalls() {
  rustCallCount++;
  document.getElementById('rust-calls').textContent = rustCallCount;
}

// 更新运行时间
function updateUptime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('uptime').textContent = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// ==================== 导航逻辑 ====================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSection = item.dataset.section;
      
      // 更新导航状态
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // 切换显示区域
      sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection) {
          section.classList.add('active');
        }
      });
    });
  });
}

// ==================== Greet 功能 ====================
async function greet() {
  const name = document.getElementById('greet-input').value || '世界';
  try {
    incrementRustCalls();
    const result = await invoke('greet', { name });
    document.getElementById('greet-result').innerHTML = `<span class="success">✅ ${result}</span>`;
  } catch (e) {
    document.getElementById('greet-result').innerHTML = `<span class="error">❌ 错误: ${e}</span>`;
  }
}

// ==================== 计算功能 ====================
async function calculate() {
  const a = parseFloat(document.getElementById('num-a').value) || 0;
  const b = parseFloat(document.getElementById('num-b').value) || 0;
  const op = document.getElementById('operation').value;
  
  try {
    incrementRustCalls();
    const result = await invoke('calculate', { a, b, operation: op });
    document.getElementById('calc-result').innerHTML = `<span class="success">✅ 结果: ${result}</span>`;
  } catch (e) {
    document.getElementById('calc-result').innerHTML = `<span class="error">❌ 错误: ${e}</span>`;
  }
}

// ==================== 对话框功能 ====================
function showAlert() {
  alert('这是一个原生 Alert 对话框！\n\n由 Tauri 应用触发。');
  document.getElementById('dialog-result').innerHTML = '<span class="success">✅ Alert 已显示</span>';
}

function showConfirm() {
  const result = confirm('你确定要执行此操作吗？');
  document.getElementById('dialog-result').innerHTML = 
    `<span class="${result ? 'success' : 'warning'}">用户选择: ${result ? '✅ 确认' : '❌ 取消'}</span>`;
}

function showPrompt() {
  const result = prompt('请输入你的名字:', '');
  if (result !== null) {
    document.getElementById('dialog-result').innerHTML = 
      `<span class="success">✅ 输入内容: "${result}"</span>`;
  } else {
    document.getElementById('dialog-result').innerHTML = 
      `<span class="warning">❌ 用户取消了输入</span>`;
  }
}

// ==================== 进度条功能 ====================
async function simulateProgress() {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const btn = document.getElementById('btn-progress');
  
  btn.disabled = true;
  
  for (let i = 0; i <= 100; i += 5) {
    incrementRustCalls();
    try {
      await invoke('simulate_work', { progress: i });
    } catch (e) {
      console.error(e);
    }
    progressBar.value = i;
    progressText.textContent = `${i}%`;
    await new Promise(r => setTimeout(r, 100));
  }
  
  btn.disabled = false;
}

// ==================== 表格数据 ====================
async function loadTableData() {
  try {
    incrementRustCalls();
    const data = await invoke('get_table_data');
    const tbody = document.querySelector('#demo-table tbody');
    
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.type_name}</td>
        <td><span class="status-badge ${item.status}">${item.status}</span></td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('加载表格失败:', e);
  }
}

// ==================== JSON 数据 ====================
async function loadJsonData() {
  try {
    incrementRustCalls();
    const data = await invoke('get_json_data');
    document.getElementById('json-output').textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    document.getElementById('json-output').textContent = `错误: ${e}`;
  }
}

// ==================== 系统信息 ====================
async function getSystemInfo() {
  try {
    incrementRustCalls();
    const info = await invoke('get_system_info');
    document.getElementById('sys-os').textContent = info.os;
    document.getElementById('sys-arch').textContent = info.arch;
    document.getElementById('sys-hostname').textContent = info.hostname;
    document.getElementById('sys-tauri').textContent = info.tauri_version;
  } catch (e) {
    console.error('获取系统信息失败:', e);
  }
}

// ==================== 斐波那契计算 ====================
async function calcFibRust() {
  const n = parseInt(document.getElementById('fib-input').value) || 40;
  const resultEl = document.getElementById('fib-result');
  resultEl.innerHTML = '<span class="loading">⏳ Rust 计算中...</span>';
  
  const start = performance.now();
  try {
    incrementRustCalls();
    const result = await invoke('fibonacci', { n });
    const elapsed = (performance.now() - start).toFixed(2);
    resultEl.innerHTML = `<span class="success">✅ Rust 结果: fib(${n}) = ${result}<br>耗时: ${elapsed}ms</span>`;
  } catch (e) {
    resultEl.innerHTML = `<span class="error">❌ 错误: ${e}</span>`;
  }
}

function fibJs(n) {
  if (n <= 1) return n;
  return fibJs(n - 1) + fibJs(n - 2);
}

function calcFibJs() {
  const n = parseInt(document.getElementById('fib-input').value) || 40;
  const resultEl = document.getElementById('fib-result');
  resultEl.innerHTML = '<span class="loading">⏳ JavaScript 计算中...</span>';
  
  setTimeout(() => {
    const start = performance.now();
    const result = fibJs(n);
    const elapsed = (performance.now() - start).toFixed(2);
    resultEl.innerHTML = `<span class="success">✅ JS 结果: fib(${n}) = ${result}<br>耗时: ${elapsed}ms</span>`;
  }, 10);
}

// ==================== 文件操作 ====================
async function saveFile() {
  const content = document.getElementById('file-content').value;
  try {
    incrementRustCalls();
    const result = await invoke('save_file', { content });
    document.getElementById('file-result').innerHTML = `<span class="success">✅ ${result}</span>`;
  } catch (e) {
    document.getElementById('file-result').innerHTML = `<span class="error">❌ 保存失败: ${e}</span>`;
  }
}

async function readFile() {
  try {
    incrementRustCalls();
    const content = await invoke('read_file_content');
    document.getElementById('file-content').value = content;
    document.getElementById('file-result').innerHTML = `<span class="success">✅ 文件已读取</span>`;
  } catch (e) {
    document.getElementById('file-result').innerHTML = `<span class="error">❌ 读取失败: ${e}</span>`;
  }
}

async function listDirectory() {
  try {
    incrementRustCalls();
    const files = await invoke('list_directory');
    document.getElementById('dir-output').textContent = JSON.stringify(files, null, 2);
  } catch (e) {
    document.getElementById('dir-output').textContent = `错误: ${e}`;
  }
}

// ==================== 滑块值更新 ====================
function setupRangeInput() {
  const rangeInput = document.getElementById('range-input');
  const rangeValue = document.getElementById('range-value');
  rangeInput.addEventListener('input', () => {
    rangeValue.textContent = rangeInput.value;
  });
}

// ==================== 初始化 ====================
window.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupRangeInput();
  
  // 更新运行时间
  setInterval(updateUptime, 1000);
  
  // 获取平台信息
  try {
    const info = await invoke('get_system_info');
    document.getElementById('platform').textContent = info.os;
  } catch (e) {
    document.getElementById('platform').textContent = 'Unknown';
  }
  
  // 绑定事件
  document.getElementById('greet-btn').addEventListener('click', greet);
  document.getElementById('calc-btn').addEventListener('click', calculate);
  document.getElementById('btn-alert').addEventListener('click', showAlert);
  document.getElementById('btn-confirm').addEventListener('click', showConfirm);
  document.getElementById('btn-prompt').addEventListener('click', showPrompt);
  document.getElementById('btn-progress').addEventListener('click', simulateProgress);
  document.getElementById('btn-load-table').addEventListener('click', loadTableData);
  document.getElementById('btn-load-json').addEventListener('click', loadJsonData);
  document.getElementById('btn-sysinfo').addEventListener('click', getSystemInfo);
  document.getElementById('btn-fib').addEventListener('click', calcFibRust);
  document.getElementById('btn-fib-js').addEventListener('click', calcFibJs);
  document.getElementById('btn-save-file').addEventListener('click', saveFile);
  document.getElementById('btn-read-file').addEventListener('click', readFile);
  document.getElementById('btn-list-dir').addEventListener('click', listDirectory);
  
  // Enter 键触发 greet
  document.getElementById('greet-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') greet();
  });
});
