# Tauri Demo 🚀

一个用 Rust + Tauri 构建的跨平台桌面应用示例。

## 技术栈

[![Tauri](https://img.shields.io/badge/Tauri-2.x-6DB3F2?style=for-the-badge&logo=tauri&logoColor=FFFFFF)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=000000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=FFFFFF)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=FFFFFF)](https://vitejs.dev/)
[![Rust](https://img.shields.io/badge/Rust-1.75-DEA584?style=for-the-badge&logo=rust&logoColor=FFFFFF)](https://www.rust-lang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=FFFFFF)](https://nodejs.org/)

## 功能

- 跨平台支持 (Windows, macOS, Linux)
- 原生系统集成
- 快速且轻量

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式运行
npm run tauri dev
```

## 构建发布

```bash
# 构建生产版本
npm run tauri build
```

## GitHub Actions 自动构建

本项目使用 GitHub Actions 自动构建。在 commit message 中包含以下关键词可触发相应操作：

| 关键词 | 作用 |
|--------|------|
| `build action` | 触发构建并上传 Artifact |
| `build release` | 触发构建并创建 Release |

示例：
```bash
git commit -m "feat: add new feature - build action"
git commit -m "fix: bug fix - build release"
```

## 下载

[![GitHub](https://img.shields.io/badge/GitHub-Releases-2ea44f?style=for-the-badge&logo=github&logoColor=FFFFFF)](https://github.com/VincentZyu233/tauri-demo/releases)

前往 [Releases](https://github.com/VincentZyu233/tauri-demo/releases) 页面下载预编译版本。

## 许可证

[![MIT License](https://img.shields.io/badge/License-MIT-olive?style=for-the-badge)](LICENSE)

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。
