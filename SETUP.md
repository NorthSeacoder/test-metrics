# 🚀 快速配置指南 | Quick Setup Guide

## 📋 配置清单 | Configuration Checklist

### 1. 基础项目配置 | Basic Project Configuration

- [ ] 修改 `package.json` 中的项目信息
  - [ ] `name`: 修改包名
  - [ ] `description`: 修改项目描述
  - [ ] `author`: 修改作者信息
  - [ ] `repository`: 修改仓库地址
  - [ ] `homepage`: 修改主页地址
  - [ ] `bugs`: 修改 issues 地址

- [ ] 更新 `README.md`
  - [ ] 修改项目标题和描述
  - [ ] 更新 badges 中的仓库地址
  - [ ] 添加项目特定的使用说明

- [ ] 更新 `LICENSE` 文件
  - [ ] 修改版权信息和年份

### 2. GitHub 仓库配置 | GitHub Repository Configuration

#### 必需的 Secrets | Required Secrets

- [ ] **`NPM_TOKEN`** - NPM 发布令牌

  ```bash
  # 1. 登录 NPM
  npm login

  # 2. 创建自动化 Token
  npm token create --type=automation

  # 3. 复制 Token 到 GitHub Secrets
  # GitHub Repository → Settings → Secrets and variables → Actions
  # Name: NPM_TOKEN
  # Value: npm_xxxxxxxxxx
  ```

- [ ] **`CODECOV_TOKEN`** - Codecov 上传令牌

  **方式一：Repository Token（推荐单个仓库）**

  ```bash
  # 1. 访问 https://codecov.io
  # 2. 使用 GitHub 账号登录
  # 3. 点击 "Add new repository"
  # 4. 选择你的仓库
  # 5. 复制 "Repository Upload Token"
  # 6. 添加到 GitHub Secrets
  # Name: CODECOV_TOKEN
  # Value: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  ```

  **方式二：Global Token（推荐多个仓库）**

  ```bash
  # 1. 访问 https://codecov.io
  # 2. 使用 GitHub 账号登录
  # 3. 进入组织设置 (Organization Settings)
  # 4. 点击 "Global Upload Token"
  # 5. 生成或复制现有的 Global Token
  # 6. 添加到 GitHub Secrets
  # Name: CODECOV_TOKEN
  # Value: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

  # 注意事项：
  # - Global Token 权限较大，可访问组织下所有仓库
  # - 注意仓库名称大小写问题，确保与 GitHub 仓库名完全一致
  # - 适合管理多个仓库的场景
  ```

#### 分支保护规则 | Branch Protection Rules

- [ ] 设置 `main` 分支保护

  ```
  GitHub Repository → Settings → Branches → Add rule

  Branch name pattern: main
  ✅ Require a pull request before merging
  ✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ Restrict pushes that create files larger than 100MB
  ```

### 3. 本地开发环境 | Local Development Environment

- [ ] 安装依赖

  ```bash
  pnpm install
  ```

- [ ] 配置 Git Hooks

  ```bash
  # 自动执行（通过 postinstall 脚本）
  # Automatically executed via postinstall script
  pnpm prepare
  ```

- [ ] 验证开发环境

  ```bash
  # 运行测试
  pnpm test

  # 类型检查
  pnpm typecheck

  # 代码检查
  pnpm lint

  # 构建
  pnpm build
  ```

### 4. 可选配置 | Optional Configuration

#### 4.1 自定义 CLI 命令名称 | Custom CLI Command Name

- [ ] 修改 `package.json` 中的 `bin` 字段

  ```json
  {
    "bin": {
      "your-cli-name": "bin/starter.js"
    }
  }
  ```

- [ ] 更新 `README.md` 中的 CLI 使用示例

#### 4.2 调整 CI 策略 | Adjust CI Strategy

**当前配置（优化版）**：

- 主测试：Ubuntu + Node.js 20/22
- 跨平台测试：仅在 main 分支运行
- 节省 65% GitHub Actions 分钟数

**如需完整测试矩阵**：

```bash
# 恢复完整 CI 配置
mv .github/workflows/ci-full.yml.bak .github/workflows/ci-full.yml
mv .github/workflows/ci.yml .github/workflows/ci-optimized.yml
mv .github/workflows/ci-full.yml .github/workflows/ci.yml
```

**自定义测试矩阵**：

```yaml
# 修改 .github/workflows/ci.yml
strategy:
  matrix:
    node-version: [18, 20, 22] # 添加更多 Node.js 版本
    # 注意：每增加一个版本会增加 CI 分钟数使用
```

#### 4.3 配置发布策略 | Configure Release Strategy

- [ ] 修改 `bumpp` 配置（如果需要）
- [ ] 设置自动 CHANGELOG 生成
- [ ] 配置语义化版本规则

## 🔍 验证配置 | Verify Configuration

### 本地验证 | Local Verification

```bash
# 1. 完整 CI 流程
pnpm ci

# 2. 测试 CLI
pnpm start --help

# 3. 测试构建产物
node dist/index.js
```

### GitHub Actions 验证 | GitHub Actions Verification

```bash
# 推送代码触发 CI
git add .
git commit -m "feat: initial setup"
git push origin main

# 检查 Actions 页面
# Check Actions page: https://github.com/your-username/your-repo/actions
```

## 🎯 下一步 | Next Steps

- [ ] 开始开发你的库功能
- [ ] 编写测试用例
- [ ] 完善文档
- [ ] 发布第一个版本

## 🆘 需要帮助？ | Need Help?

- 查看 [README.md](./README.md) 获取详细使用说明
- 查看 [Issues](https://github.com/NorthSeacoder/lib-starter/issues) 寻找解决方案
- 创建新的 Issue 报告问题

---

**提示**: 完成所有配置后，删除此 `SETUP.md` 文件。

**Tip**: Delete this `SETUP.md` file after completing all configurations.
