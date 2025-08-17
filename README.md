# TypeScript Library Starter

> 🚀 现代化 TypeScript 库开发模板 | Modern TypeScript Library Development Template

[![CI](https://github.com/NorthSeacoder/lib-starter/workflows/CI/badge.svg)](https://github.com/NorthSeacoder/lib-starter/actions)
[![codecov](https://codecov.io/gh/NorthSeacoder/lib-starter/branch/main/graph/badge.svg)](https://codecov.io/gh/NorthSeacoder/lib-starter)
[![npm version](https://badge.fury.io/js/%40nsea%2Fstarter.svg)](https://badge.fury.io/js/%40nsea%2Fstarter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个功能完整的 TypeScript 库开发模板，包含完整的开发环境、构建工具和最佳实践配置。

A complete TypeScript library development template with full development environment, build tools, and best practice configurations.

## ✨ 核心特性 | Features

### 中文

- **🔧 现代化工具链**：基于最新的 TypeScript、Vitest、tsup 构建
- **📦 多格式输出**：支持 ESM、CJS 双格式输出
- **🧪 完整测试环境**：Vitest + 测试覆盖率 + UI 界面
- **🚀 快速开发**：热重载、类型检查、代码格式化一应俱全
- **📝 规范化提交**：集成 Commitizen 规范化提交流程
- **🔍 质量保证**：ESLint、Prettier、类型检查全覆盖
- **📤 自动发布**：一键构建、检查、发布完整流程
- **🎯 CLI 支持**：内置 CLI 框架，快速开发命令行工具

### English

- **🔧 Modern Toolchain**: Built with latest TypeScript, Vitest, tsup
- **📦 Multi-format Output**: Supports both ESM and CJS formats
- **🧪 Complete Testing**: Vitest + Coverage + UI interface
- **🚀 Fast Development**: Hot reload, type checking, code formatting
- **📝 Conventional Commits**: Integrated Commitizen workflow
- **🔍 Quality Assurance**: Complete ESLint, Prettier, type checking
- **📤 Auto Publishing**: One-click build, check, publish workflow
- **🎯 CLI Ready**: Built-in CLI framework for command-line tools

## 🚀 快速开始 | Quick Start

### 使用模板 | Using Template

```bash
# 使用 GitHub 模板创建新项目
# Create new project using GitHub template
git clone https://github.com/NorthSeacoder/lib-starter.git my-lib
cd my-lib

# 安装依赖
# Install dependencies
pnpm install

# 开发模式
# Development mode
pnpm dev
```

## 🔐 CI/CD 配置 | CI/CD Configuration

### GitHub Secrets 配置 | GitHub Secrets Setup

为了启用完整的 CI/CD 流程，你需要在 GitHub 仓库中配置以下 Secrets：

To enable the complete CI/CD pipeline, you need to configure the following Secrets in your GitHub repository:

#### 必需的 Secrets | Required Secrets

1. **`NPM_TOKEN`** - NPM 发布令牌 | NPM Publishing Token

   ```bash
   # 获取 NPM Token | Get NPM Token
   npm login
   npm token create --type=automation
   ```

   - 用途：自动发布包到 NPM 注册表
   - Purpose: Automatically publish packages to NPM registry

2. **`CODECOV_TOKEN`** - Codecov 上传令牌 | Codecov Upload Token

   ```bash
   # 1. 访问 https://codecov.io
   # 2. 使用 GitHub 账号登录
   # 3. 添加你的仓库
   # 4. 复制 Repository Upload Token
   ```

   - 用途：上传测试覆盖率报告到 Codecov
   - Purpose: Upload test coverage reports to Codecov

#### 配置步骤 | Configuration Steps

1. **进入仓库设置 | Go to Repository Settings**

   ```
   GitHub Repository → Settings → Secrets and variables → Actions
   ```

2. **添加 Secrets | Add Secrets**
   - 点击 "New repository secret"
   - 分别添加 `NPM_TOKEN` 和 `CODECOV_TOKEN`
   - Click "New repository secret"
   - Add `NPM_TOKEN` and `CODECOV_TOKEN` respectively

3. **验证配置 | Verify Configuration**
   ```bash
   # 推送代码触发 CI
   # Push code to trigger CI
   git push origin main
   ```

#### 可选配置 | Optional Configuration

- **`GITHUB_TOKEN`**: 自动提供，无需手动配置
- **`GITHUB_TOKEN`**: Automatically provided, no manual configuration needed

### CI/CD 流程说明 | CI/CD Pipeline Overview

#### 测试阶段 | Test Stage

- **多环境测试**: Node.js 18/20/22 × Ubuntu/Windows/macOS
- **代码质量检查**: ESLint + Prettier + TypeScript
- **测试覆盖率**: Vitest + Codecov 报告
- **构建验证**: tsup 构建 + 导出检查

#### 发布阶段 | Release Stage

- **自动触发**: 推送到 `main` 分支时自动执行
- **版本管理**: 使用 `bumpp` 自动版本升级
- **NPM 发布**: 自动发布到 NPM 注册表

### 禁用 Codecov（可选）| Disable Codecov (Optional)

如果不需要代码覆盖率分析，可以移除 CI 中的 Codecov 步骤：

If you don't need code coverage analysis, you can remove the Codecov step from CI:

```yaml
# 删除 .github/workflows/ci.yml 中的这部分
# Remove this section from .github/workflows/ci.yml
- name: Upload coverage to Codecov
  if: matrix.os == 'ubuntu-latest' && matrix.node-version == 20
  uses: codecov/codecov-action@v3
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

### 故障排除 | Troubleshooting

#### 常见问题 | Common Issues

1. **NPM 发布失败**

   ```bash
   # 检查 NPM Token 是否正确配置
   # Check if NPM Token is correctly configured
   npm whoami --registry https://registry.npmjs.org
   ```

2. **Codecov 上传失败**

   ```bash
   # 检查 Codecov Token 和仓库配置
   # Check Codecov Token and repository configuration
   # 确保在 codecov.io 中已添加仓库
   # Make sure repository is added in codecov.io
   ```

3. **测试覆盖率不足**
   ```bash
   # 查看详细覆盖率报告
   # View detailed coverage report
   pnpm test:coverage
   open coverage/index.html
   ```

### 本地开发 | Local Development

```bash
# 开发模式（CLI）
# Development mode (CLI)
pnpm dev

# 构建项目
# Build project
pnpm build

# 运行测试
# Run tests
pnpm test

# 测试 UI 界面
# Test UI interface
pnpm test:ui

# 类型检查
# Type checking
pnpm typecheck

# 代码检查
# Linting
pnpm lint

# 格式化代码
# Format code
pnpm format
```

## 📋 项目结构 | Project Structure

```
lib-starter/
├── src/                    # 源代码 | Source code
│   ├── cli/               # CLI 相关 | CLI related
│   │   ├── index.ts       # CLI 入口 | CLI entry
│   │   ├── parse-args.ts  # 参数解析 | Argument parsing
│   │   └── run.ts         # 运行入口 | Run entry
│   ├── types/             # 类型定义 | Type definitions
│   │   └── starter.ts     # 核心类型 | Core types
│   ├── index.ts           # 库入口 | Library entry
│   └── starter.ts         # 核心功能 | Core functionality
├── bin/                   # CLI 可执行文件 | CLI executables
├── dist/                  # 构建输出 | Build output
├── package.json           # 项目配置 | Project config
├── tsconfig.json          # TS 配置 | TS config
├── tsup.config.ts         # 构建配置 | Build config
└── vitest.config.ts       # 测试配置 | Test config
```

## 🛠️ 技术栈 | Tech Stack

### 核心工具 | Core Tools

- **TypeScript 5.5+** - 类型安全的 JavaScript | Type-safe JavaScript
- **tsup** - 基于 esbuild 的快速构建工具 | Fast bundler based on esbuild
- **Vitest** - 现代化测试框架 | Modern testing framework
- **Commander.js** - CLI 框架 | CLI framework

### 开发工具 | Development Tools

- **tsx** - TypeScript 运行时 | TypeScript runtime
- **@vitest/ui** - 测试 UI 界面 | Test UI interface
- **bumpp** - 版本管理 | Version management
- **rimraf** - 跨平台文件删除 | Cross-platform file removal

### 质量保证 | Quality Assurance

- **@arethetypeswrong/cli** - 类型导出检查 | Type export validation
- **Commitizen** - 规范化提交 | Conventional commits
- **esbuild-visualizer** - 构建分析 | Bundle analysis

## 📝 使用指南 | Usage Guide

### 作为库使用 | Using as Library

```typescript
import { starter, starterAsync } from '@nsea/starter'
import type { StarterOptions } from '@nsea/starter'

// 同步使用 | Sync usage
const result = starter({
  input: './input',
  output: './output',
  verbose: true,
})

// 异步使用 | Async usage
const result = await starterAsync({
  input: './input',
  output: './output',
  dryRun: true,
})
```

### 作为 CLI 使用 | Using as CLI

```bash
# 基本用法 | Basic usage
starter --help

# 带参数运行 | Run with options
starter --input ./src --output ./dist --verbose

# 预览模式 | Dry run mode
starter --dry-run
```

### 自定义配置 | Custom Configuration

```typescript
// src/starter.ts
export function starter(options: StarterOptions = {}): StarterResult {
  // 在这里实现你的核心逻辑
  // Implement your core logic here

  return {
    success: true,
    message: 'Operation completed',
  }
}
```

## 🔧 配置说明 | Configuration

### TypeScript 配置 | TypeScript Config

项目使用现代 TypeScript 配置，支持：
The project uses modern TypeScript configuration with:

- **ES2022** 目标版本 | target version
- **Node16** 模块解析 | module resolution
- **严格模式** | Strict mode
- **装饰器支持** | Decorator support

### 构建配置 | Build Config

使用 tsup 构建，特性包括：
Built with tsup featuring:

- **双格式输出**: ESM + CJS | Dual format: ESM + CJS
- **类型声明生成** | Type declaration generation
- **源码映射** | Source maps
- **代码分割** | Code splitting
- **构建分析** | Bundle analysis

### 测试配置 | Test Config

使用 Vitest 测试框架：
Testing with Vitest framework:

- **快速执行** | Fast execution
- **热重载** | Hot reload
- **覆盖率报告** | Coverage reports
- **UI 界面** | UI interface

## 📦 发布流程 | Publishing

### 自动发布 | Automated Publishing

```bash
# 完整的 CI 流程
# Complete CI pipeline
pnpm ci

# 发布新版本
# Publish new version
pnpm release
```

### 手动发布 | Manual Publishing

```bash
# 1. 构建项目 | Build project
pnpm build

# 2. 运行检查 | Run checks
pnpm check-exports
pnpm lint
pnpm typecheck
pnpm test

# 3. 版本升级 | Bump version
pnpm bumpp

# 4. 发布到 npm | Publish to npm
npm publish
```

## 🤝 贡献指南 | Contributing

### 开发规范 | Development Standards

1. **代码风格** | Code Style
   - 使用 TypeScript | Use TypeScript
   - 遵循项目配置的格式规范 | Follow project formatting rules

2. **提交规范** | Commit Convention

   ```bash
   # 使用 commitizen
   # Use commitizen
   pnpm cz
   ```

3. **测试要求** | Testing Requirements
   - 新功能必须包含测试 | New features must include tests
   - 保持测试覆盖率 | Maintain test coverage

### 项目自定义 | Project Customization

1. **修改项目信息** | Update Project Info
   - 更新 `package.json` 中的名称、描述等 | Update name, description in `package.json`
   - 修改 README 中的项目介绍 | Update project intro in README

2. **实现核心功能** | Implement Core Features
   - 在 `src/starter.ts` 中实现主要逻辑 | Implement main logic in `src/starter.ts`
   - 更新类型定义 `src/types/starter.ts` | Update type definitions

3. **自定义 CLI** | Customize CLI
   - 修改 `src/cli/parse-args.ts` 中的参数定义 | Update argument definitions
   - 调整 CLI 行为逻辑 | Adjust CLI behavior logic

## 📜 许可证 | License

MIT License - 详见 [LICENSE](./LICENSE) 文件 | See [LICENSE](./LICENSE) file for details

---

**⭐ 如果这个模板对你有帮助，请给我们一个 Star！**
**⭐ If this template helps you, please give us a Star!**

**🐛 遇到问题？** | **🐛 Issues?**
[提交 Issue](https://github.com/NorthSeacoder/lib-starter/issues) | [Submit Issue](https://github.com/NorthSeacoder/lib-starter/issues)

**💬 交流讨论？** | **💬 Discussions?**
[加入讨论](https://github.com/NorthSeacoder/lib-starter/discussions) | [Join Discussions](https://github.com/NorthSeacoder/lib-starter/discussions)
