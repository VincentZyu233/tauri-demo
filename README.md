# Tauri 桌面应用 Demo - 概念验证

> 使用 **Tauri 2.0 + Rust** 构建的跨平台桌面应用 Demo  
> 目标平台: Linux x64 / Windows x64

## 🚀 功能演示

- ✅ **输入组件**: 文本、数字、滑块、日期、颜色选择器等
- ✅ **Rust 后端交互**: 问候、数学计算、斐波那契性能测试
- ✅ **数据展示**: 表格数据、JSON 数据展示
- ✅ **系统集成**: 获取系统信息、文件读写
- ✅ **UI 组件**: 按钮样式、对话框、进度条

## 📦 项目结构

```
tairi-demo/
├── src/                    # 前端代码 (HTML/CSS/JS)
│   ├── index.html
│   ├── main.js
│   └── styles.css
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── lib.rs          # Tauri 命令
│   │   └── main.rs         # 入口
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## 🛠️ 开发环境设置

### 1. 安装依赖

```bash
# 安装 Node.js 依赖
yarn install

# 或使用代理
proxychains4 yarn install
```

### 2. 开发模式运行

```bash
yarn tauri dev
```

## 🏗️ 构建发布

### Linux x64 (本地构建)

```bash
# 添加 target (如果没有)
rustup target add x86_64-unknown-linux-gnu

# 构建
yarn tauri build

# 产物位置: src-tauri/target/release/bundle/
# - AppImage: tauri-app_0.1.0_amd64.AppImage
# - deb: tauri-app_0.1.0_amd64.deb
```

### Windows x64 (交叉编译)

由于 Tauri 2.0 使用系统 WebView，Windows 交叉编译有限制。推荐以下方案:

#### 方案 A: GitHub Actions (推荐)

在 `.github/workflows/build.yml` 中配置多平台构建:

```yaml
name: Build
on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: yarn install
      - run: yarn tauri build
      - uses: actions/upload-artifact@v4
        with:
          name: app-${{ matrix.platform }}
          path: src-tauri/target/release/bundle/
```

#### 方案 B: Docker + Wine (实验性)

```bash
# 安装 MinGW 工具链
sudo apt install mingw-w64

# 添加 Windows target
rustup target add x86_64-pc-windows-gnu

# 尝试编译 (可能需要额外配置)
cargo build --release --target x86_64-pc-windows-gnu
```

#### 方案 C: Windows 虚拟机/WSL

在 Windows 环境下直接构建是最可靠的方式。

## ⚡ 性能对比

| 特性 | Tauri | Electron |
|------|-------|----------|
| 打包体积 | ~5-10 MB | ~150+ MB |
| 内存占用 | 较低 | 较高 |
| 启动速度 | 快 | 慢 |
| 后端语言 | Rust | Node.js |

## 📝 交叉编译注意事项

1. **Tauri 依赖系统 WebView**
   - Linux: WebKitGTK
   - Windows: Edge WebView2
   - 这使得真正的交叉编译变得复杂

2. **推荐的多平台构建策略**
   - 使用 CI/CD (GitHub Actions, GitLab CI)
   - 每个平台在原生环境构建

3. **纯 Rust 部分可以交叉编译**
   - 业务逻辑可以单独测试
   - `cargo build --target x86_64-pc-windows-gnu`

## 🔗 相关资源

- [Tauri 官方文档](https://tauri.app)
- [Rust 交叉编译](https://rust-lang.github.io/rustup/cross-compilation.html)
- [cross 工具](https://github.com/cross-rs/cross) - 简化交叉编译

