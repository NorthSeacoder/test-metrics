# 简化工作流程 / Simplified Workflow

## 🎯 **设计理念**

回归简单，专注核心功能：

- **GitHub Actions** - 只负责测试，确保代码质量
- **发布流程** - 手动控制，灵活可靠
- **依赖管理** - 自动化更新（可选）

## 🔧 **当前配置**

### **1. GitHub Actions (`.github/workflows/ci.yml`)**

```yaml
name: Test

on:
  push:
    branches: [main] # 只在 main 分支运行
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22] # 测试两个 Node.js 版本

    steps:
      - 安装依赖
      - 运行 pnpm run ci (包含 lint + format + typecheck + test + build)
      - 检查导出配置 (仅 Node.js 20)
      - 上传覆盖率到 Codecov (仅 Node.js 20)
```

#### **特点**

- ✅ **简单高效** - 只做测试，不做发布
- ✅ **节省资源** - 只在 main 分支运行
- ✅ **快速反馈** - 合并步骤减少执行时间
- ✅ **质量保证** - 完整的代码质量检查

### **2. 发布流程 (`package.json`)**

```json
{
  "scripts": {
    "release": "bumpp && npm publish"
  }
}
```

#### **使用方法**

```bash
# 手动发布
npm run release

# 流程：
# 1. bumpp 交互式选择版本 (patch/minor/major)
# 2. 自动更新 package.json 版本号
# 3. 自动创建 git commit 和 tag
# 4. 自动推送到远程仓库
# 5. 自动发布到 NPM
```

#### **优势**

- ✅ **完全控制** - 开发者决定何时发布
- ✅ **版本选择** - 交互式选择合适的版本类型
- ✅ **简单可靠** - 一个命令完成所有操作
- ✅ **易于调试** - 本地执行，问题容易定位

### **3. 依赖管理 (`.github/dependabot.yml`)**

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly' # 每周检查一次
```

#### **功能**

- 🔄 **自动检查** - 每周一检查依赖更新
- 📝 **自动 PR** - 发现更新时创建 Pull Request
- 🛡️ **安全更新** - 自动修复安全漏洞
- ⚙️ **可配置** - 可以忽略特定依赖的 major 更新

#### **是否保留？**

- **保留优势** - 减少手动维护工作，及时获得安全更新
- **删除理由** - 如果你喜欢完全手动控制依赖版本

## 📊 **简化前后对比**

| 项目               | 简化前              | 简化后         |
| ------------------ | ------------------- | -------------- |
| **GitHub Actions** | 复杂的 CI/CD 流程   | 简单的测试流程 |
| **发布方式**       | 自动发布 + 手动发布 | 只有手动发布   |
| **配置文件**       | 多个复杂配置        | 最少必要配置   |
| **文档数量**       | 多个详细文档        | 一个简化说明   |
| **学习成本**       | 高                  | 低             |
| **维护成本**       | 高                  | 低             |

## 🚀 **日常使用流程**

### **开发阶段**

```bash
# 1. 开发功能
git checkout -b feature/new-feature
# ... 编写代码 ...

# 2. 提交代码
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. 创建 PR
# GitHub 自动运行测试
```

### **发布阶段**

```bash
# 1. 合并到 main 分支
git checkout main
git pull origin main

# 2. 发布新版本
npm run release
# 交互式选择版本类型 (patch/minor/major)
# 自动完成版本发布和 NPM 发布
```

### **维护阶段**

```bash
# Dependabot 会自动创建依赖更新 PR
# 审查并合并安全更新和重要更新
```

## 🛠️ **可选配置**

### **删除 Dependabot（如果不需要）**

```bash
rm .github/dependabot.yml
```

### **自定义发布脚本**

```json
{
  "scripts": {
    "release": "bumpp && npm publish",
    "release:patch": "bumpp patch && npm publish",
    "release:minor": "bumpp minor && npm publish",
    "release:major": "bumpp major && npm publish"
  }
}
```

### **添加预发布检查**

```json
{
  "scripts": {
    "prerelease": "npm run ci",
    "release": "bumpp && npm publish"
  }
}
```

## 🎯 **适用场景**

### **适合的项目**

- ✅ **个人项目** - 简单可控
- ✅ **小团队项目** - 沟通成本低
- ✅ **工具库** - 发布频率不高
- ✅ **学习项目** - 专注核心功能

### **不适合的项目**

- ❌ **大团队项目** - 需要更严格的流程控制
- ❌ **高频发布项目** - 手动发布效率低
- ❌ **企业级项目** - 需要更完善的 CI/CD

## 📚 **相关工具**

### **核心工具**

- [bumpp](https://github.com/antfu/bumpp) - 版本管理工具
- [GitHub Actions](https://github.com/features/actions) - CI/CD 平台
- [Dependabot](https://github.com/dependabot) - 依赖更新工具

### **测试工具**

- [Vitest](https://vitest.dev/) - 测试框架
- [ESLint](https://eslint.org/) - 代码检查
- [Prettier](https://prettier.io/) - 代码格式化
- [TypeScript](https://www.typescriptlang.org/) - 类型检查

## 🎉 **总结**

通过这次简化，我们实现了：

- ✅ **回归简单** - 移除了复杂的自动化发布流程
- ✅ **专注核心** - GitHub Actions 只负责测试
- ✅ **手动控制** - 发布时机和版本类型完全由开发者决定
- ✅ **易于理解** - 配置简单，新手友好
- ✅ **稳定可靠** - 减少了自动化带来的潜在问题

现在的 `lib-starter` 模板更符合"简单工具库"的定位，既保证了代码质量，又保持了使用的简单性！🚀
