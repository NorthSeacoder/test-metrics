# 开发到发布流程 / Development to Release Workflow

## 🎯 **完整的开发流程**

### **1. 本地开发阶段**

#### **环境准备**

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd lib-starter

# 2. 安装依赖
pnpm install

# 3. 验证环境
npm run ci  # 运行完整检查
```

#### **开发循环**

```bash
# 开发模式
npm run dev:watch     # 监听模式开发
npm run test:watch    # 监听模式测试
npm run test:ui       # 可视化测试界面

# 代码质量检查
npm run lint          # 自动修复 ESLint 问题
npm run format        # 自动格式化代码
npm run typecheck     # TypeScript 类型检查

# 完整验证
npm run ci            # 运行所有检查（提交前必须通过）
```

### **2. Git 工作流**

#### **分支策略**

```bash
main        # 主分支，自动发布到 NPM
develop     # 开发分支，功能集成
feature/*   # 功能分支
hotfix/*    # 紧急修复分支
```

#### **提交流程**

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature-name

# 2. 开发和提交（使用 conventional commits）
npm run cz              # 使用 commitizen 规范提交
# 或手动提交
git add .
git commit -m "feat: add new feature"

# 3. 推送分支
git push origin feature/your-feature-name

# 4. 创建 Pull Request
# 通过 GitHub 界面创建 PR 到 develop 分支
```

### **3. 自动化检查**

#### **Git Hooks（本地）**

```json
// simple-git-hooks 配置
{
  "pre-commit": "lint-staged", // 提交前检查修改的文件
  "commit-msg": "commitizen --hook || true" // 提交信息格式检查
}
```

#### **CI/CD 流程（GitHub Actions）**

```yaml
# .github/workflows/ci.yml
触发条件:
  - push to main/develop
  - pull request to main/develop

检查矩阵:
  - Node.js: 20, 22
  - OS: ubuntu, windows, macos

检查步骤: 1. Lint 检查
  2. 格式化检查
  3. 类型检查
  4. 测试覆盖率
  5. 构建验证
  6. 导出检查
```

## 🚀 **发布流程详解**

### **发布策略对比**

| 场景         | 本地发布                | 自动发布       | 使用时机         |
| ------------ | ----------------------- | -------------- | ---------------- |
| **开发测试** | `npm run release:local` | -              | 本地测试发布流程 |
| **正式发布** | -                       | GitHub Actions | 生产环境发布     |
| **紧急修复** | `npm run release:local` | GitHub Actions | 根据紧急程度选择 |

### **1. 自动发布（推荐）**

#### **触发条件**

```yaml
# 只有推送到 main 分支时才会自动发布
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

#### **发布步骤**

```yaml
1. 运行完整测试套件
2. 构建项目
3. 版本号管理 (bumpp)
4. 发布到 NPM (npm publish)
5. 创建 GitHub Release
6. 上传 Codecov 报告
```

#### **所需 Secrets**

```bash
# GitHub Repository Settings > Secrets and variables > Actions
NPM_TOKEN=npm_xxxxxxxxxxxxxxxx        # NPM 发布令牌
CODECOV_TOKEN=xxxxxxxx-xxxx-xxxx      # Codecov 上传令牌（可选）
GITHUB_TOKEN=ghp_xxxxxxxxxxxx        # GitHub 操作令牌（自动提供）

# Codecov Token 类型：
# - Repository Token: 单个仓库专用，权限精确
# - Global Token: 组织级别，管理多个仓库（你当前使用的）
```

### **2. 本地发布（备用）**

#### **使用场景**

- 🚨 **紧急修复** - 需要立即发布
- 🧪 **测试发布** - 验证发布流程
- 🔧 **CI 故障** - GitHub Actions 不可用时

#### **发布命令**

```bash
# 完整的本地发布流程
npm run release:local

# 等价于：
npm run ci           # 运行所有检查
bumpp               # 交互式版本管理
npm publish         # 发布到 NPM
```

#### **版本管理**

```bash
# bumpp 支持的版本类型
bumpp patch    # 1.0.0 -> 1.0.1 (bug fixes)
bumpp minor    # 1.0.0 -> 1.1.0 (new features)
bumpp major    # 1.0.0 -> 2.0.0 (breaking changes)
bumpp prerelease # 1.0.0 -> 1.0.1-0 (pre-release)
```

## 📦 **Package.json 配置详解**

### **Scripts 说明**

#### **开发脚本**

```json
{
  "dev": "tsx src/cli/run.ts", // 开发模式运行
  "dev:watch": "tsx watch src/cli/run.ts", // 监听模式
  "start": "node bin/starter.cjs" // 生产模式运行
}
```

#### **构建脚本**

```json
{
  "clean": "rimraf dist stats.html", // 清理构建产物
  "build": "nr clean && tsup", // 构建项目
  "build:watch": "tsup --watch", // 监听构建
  "analyze": "nr clean && tsup --metafile && esbuild-visualizer --metadata ./dist/metafile-*.json --open"
}
```

#### **质量检查脚本**

```json
{
  "lint": "eslint src --fix", // 自动修复 lint 问题
  "lint:check": "eslint src", // 只检查不修复
  "format": "prettier --write .", // 格式化代码
  "format:check": "prettier --check .", // 检查格式化
  "typecheck": "tsc --noEmit" // TypeScript 类型检查
}
```

#### **测试脚本**

```json
{
  "test": "vitest run", // 运行所有测试
  "test:watch": "vitest", // 监听模式测试
  "test:ui": "vitest --ui", // 可视化测试界面
  "test:coverage": "vitest run --coverage", // 测试覆盖率
  "test:unit": "vitest run src", // 只运行单元测试
  "test:e2e": "vitest run test/e2e" // 只运行 E2E 测试
}
```

#### **发布脚本**

```json
{
  "ci": "nr lint:check && nr format:check && nr typecheck && nr test:coverage && nr build",
  "prepublishOnly": "npm run ci", // 发布前自动运行 CI
  "release": "bumpp", // 版本管理（CI 使用）
  "release:local": "bumpp && npm publish" // 本地发布
}
```

### **Exports 字段优化**

#### **优化前（复杂）**

```json
{
  "exports": {
    ".": {
      /* 主入口 */
    },
    "./cli": {
      /* CLI 入口 - 不必要 */
    },
    "./package.json": "./package.json" // 不必要的导出
  }
}
```

#### **优化后（简洁）**

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

#### **为什么移除这些导出？**

1. **`./cli` 导出**
   - ❌ **不必要** - CLI 通过 `bin` 字段已经暴露
   - ❌ **增加复杂性** - 用户不需要直接导入 CLI 模块
   - ❌ **维护负担** - 需要维护额外的导出路径

2. **`./package.json` 导出**
   - ❌ **安全风险** - 暴露了内部配置信息
   - ❌ **不是最佳实践** - 用户应该通过 npm API 获取包信息
   - ❌ **版本耦合** - 可能导致意外的依赖关系

## 🔄 **完整发布示例**

### **场景 1: 功能发布（自动）**

```bash
# 1. 开发功能
git checkout -b feature/new-awesome-feature
# ... 开发代码 ...
npm run ci  # 确保本地通过所有检查

# 2. 提交代码
npm run cz  # 规范化提交
git push origin feature/new-awesome-feature

# 3. 创建 PR
# 通过 GitHub 界面创建 PR: feature/new-awesome-feature -> develop

# 4. 代码审查和合并
# 团队审查后合并到 develop

# 5. 发布准备
git checkout main
git merge develop  # 或通过 PR 合并

# 6. 推送触发自动发布
git push origin main
# 🚀 GitHub Actions 自动执行：
#   - 运行 CI 检查
#   - 执行 bumpp（版本管理）
#   - 发布到 NPM
#   - 创建 GitHub Release
```

### **场景 2: 紧急修复（手动）**

```bash
# 1. 创建热修复分支
git checkout main
git checkout -b hotfix/critical-bug-fix

# 2. 修复问题
# ... 修复代码 ...
npm run ci  # 确保修复正确

# 3. 本地发布（紧急情况）
npm run release:local
# 🚀 交互式选择版本类型（通常是 patch）
# 🚀 自动发布到 NPM

# 4. 合并回主分支
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# 5. 同步到开发分支
git checkout develop
git merge main
git push origin develop
```

## 🛠️ **故障排除**

### **常见问题**

#### **1. CI 检查失败**

```bash
# 本地复现问题
npm run ci

# 逐步检查
npm run lint:check     # ESLint 问题
npm run format:check   # 格式化问题
npm run typecheck      # TypeScript 问题
npm run test:coverage  # 测试问题
npm run build         # 构建问题
```

#### **2. 发布失败**

```bash
# 检查 NPM 认证
npm whoami
npm config get registry

# 检查版本冲突
npm view @nsea/starter versions --json

# 手动发布
npm run release:local
```

#### **3. GitHub Actions 失败**

```bash
# 检查 Secrets 配置
# Settings > Secrets and variables > Actions
# 确保 NPM_TOKEN 正确配置

# 检查分支保护规则
# Settings > Branches
# 确保 main 分支配置正确
```

### **最佳实践**

#### **开发阶段**

- ✅ **频繁提交** - 小步快跑，便于回滚
- ✅ **本地 CI** - 提交前运行 `npm run ci`
- ✅ **规范提交** - 使用 `npm run cz` 规范化提交信息
- ✅ **测试驱动** - 先写测试，再写功能

#### **发布阶段**

- ✅ **自动发布优先** - 减少人为错误
- ✅ **版本语义化** - 遵循 SemVer 规范
- ✅ **发布验证** - 发布后验证功能正常
- ✅ **回滚准备** - 出问题时快速回滚

#### **团队协作**

- ✅ **代码审查** - 所有 PR 都需要审查
- ✅ **分支保护** - main 分支禁止直接推送
- ✅ **文档更新** - 重要变更及时更新文档
- ✅ **变更日志** - 自动生成 CHANGELOG

---

这个流程确保了从开发到发布的每个环节都有质量保证，同时提供了灵活性来应对不同的发布场景。🚀
