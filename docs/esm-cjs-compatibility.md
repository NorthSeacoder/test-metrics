# ESM/CommonJS 兼容性修复 / ESM/CommonJS Compatibility Fix

## 🎯 **问题描述**

### **错误信息**

```bash
Import resolved to an ESM type declaration file, but a CommonJS JavaScript file.
👺 Masquerading as ESM
```

### **问题原因**

在 Node.js 16+ 环境下，当从 CommonJS 模块导入时，出现了类型声明和实际实现格式不匹配的问题：

- **类型声明**: `.d.ts` (被视为 ESM 类型)
- **实际实现**: `.cjs` (CommonJS 格式)
- **包声明**: `"type": "module"` (声明为 ESM 包)

这导致 TypeScript 和 Node.js 模块解析器产生混淆。

## 🔧 **解决方案**

### **核心思路**

为不同的模块格式提供对应的类型声明文件：

- **ESM 导入** → `.d.ts` 类型声明 + `.js` 实现
- **CommonJS 导入** → `.d.cts` 类型声明 + `.cjs` 实现

### **1. 更新 `tsup.config.ts`**

#### **修复前**

```typescript
{
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, // 只生成 .d.ts
  // ...
}
```

#### **修复后**

```typescript
{
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    // 为不同格式生成对应的类型声明文件
    compilerOptions: {
      moduleResolution: 'bundler',
    },
  },
  // ...
}
```

### **2. 更新 `package.json` exports**

#### **修复前**

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

#### **修复后**

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

## 📊 **修复效果对比**

### **修复前**

```bash
┌───────────────────┬────────────────────────┐
│                   │ "@nsea/starter"        │
├───────────────────┼────────────────────────┤
│ node10            │ 🟢                     │
├───────────────────┼────────────────────────┤
│ node16 (from CJS) │ 👺 Masquerading as ESM │  # ❌ 错误
├───────────────────┼────────────────────────┤
│ node16 (from ESM) │ 🟢 (ESM)               │
├───────────────────┼────────────────────────┤
│ bundler           │ 🟢                     │
└───────────────────┴────────────────────────┘
```

### **修复后**

```bash
┌───────────────────┬─────────────────┐
│                   │ "@nsea/starter" │
├───────────────────┼─────────────────┤
│ node10            │ 🟢              │
├───────────────────┼─────────────────┤
│ node16 (from CJS) │ 🟢 (CJS)        │  # ✅ 修复
├───────────────────┼─────────────────┤
│ node16 (from ESM) │ 🟢 (ESM)        │
├───────────────────┼─────────────────┤
│ bundler           │ 🟢              │
└───────────────────┴─────────────────┘

No problems found 🌟
```

## 🏗️ **生成的文件结构**

### **修复后的构建输出**

```bash
dist/
├── index.js        # ESM 实现
├── index.js.map    # ESM source map
├── index.cjs       # CommonJS 实现
├── index.cjs.map   # CommonJS source map
├── index.d.ts      # ESM 类型声明
├── index.d.cts     # CommonJS 类型声明
└── cli/
    ├── run.cjs     # CLI 实现
    ├── run.cjs.map # CLI source map
    └── run.d.cts   # CLI 类型声明
```

### **类型声明文件对应关系**

| 导入方式  | 实现文件    | 类型声明文件  | 说明          |
| --------- | ----------- | ------------- | ------------- |
| `import`  | `index.js`  | `index.d.ts`  | ESM 格式      |
| `require` | `index.cjs` | `index.d.cts` | CommonJS 格式 |

## 🔍 **技术原理**

### **模块解析机制**

#### **ESM 导入**

```typescript
// 用户代码
import { starter } from '@nsea/starter'

// Node.js 解析路径
// 1. 查找 exports["."]["import"]["types"] → ./dist/index.d.ts
// 2. 查找 exports["."]["import"]["default"] → ./dist/index.js
// 结果: ESM 类型声明 + ESM 实现 ✅
```

#### **CommonJS 导入**

```typescript
// 用户代码
const { starter } = require('@nsea/starter')

// Node.js 解析路径
// 1. 查找 exports["."]["require"]["types"] → ./dist/index.d.cts
// 2. 查找 exports["."]["require"]["default"] → ./dist/index.cjs
// 结果: CommonJS 类型声明 + CommonJS 实现 ✅
```

### **类型声明文件扩展名**

- **`.d.ts`** - ESM 类型声明，用于 `import` 语句
- **`.d.cts`** - CommonJS 类型声明，用于 `require()` 调用
- **`.d.mts`** - 强制 ESM 类型声明（本项目未使用）

## 📚 **相关资源**

### **官方文档**

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Node.js - Package.json exports](https://nodejs.org/api/packages.html#exports)
- [Are The Types Wrong?](https://github.com/arethetypeswrong/arethetypeswrong.github.io)

### **问题参考**

- [FalseESM Problem](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseESM.md)
- [TypeScript 4.7 - ESM/CommonJS Interop](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

## 🎯 **最佳实践**

### **1. 双重类型声明**

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

### **2. 构建工具配置**

```typescript
// tsup.config.ts
{
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: 'bundler',
    },
  },
}
```

### **3. 验证工具**

```bash
# 使用 @arethetypeswrong/cli 验证
pnpm add -D @arethetypeswrong/cli
pnpm attw --pack .
```

### **4. 包声明**

```json
{
  "type": "module", // 声明为 ESM 包
  "main": "dist/index.js", // 默认入口（ESM）
  "exports": {
    // 明确的导出映射
    // ...
  }
}
```

## 🚨 **常见陷阱**

### **1. 只有单一类型声明**

```json
// ❌ 错误：所有格式共用一个类型声明
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts", // 只有 ESM 类型
      "import": "./dist/index.js",
      "require": "./dist/index.cjs" // 但实现是 CommonJS
    }
  }
}
```

### **2. 类型声明位置错误**

```json
// ❌ 错误：types 应该在具体条件内
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}

// ✅ 正确：types 在对应的条件内
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

### **3. 构建工具配置不当**

```typescript
// ❌ 错误：只生成一种类型声明
{
  dts: true  // 只生成 .d.ts
}

// ✅ 正确：配置生成对应的类型声明
{
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: 'bundler',
    },
  }
}
```

## 🎉 **总结**

通过这次修复，我们实现了：

- ✅ **完美的 ESM/CommonJS 兼容性** - 两种导入方式都能正确工作
- ✅ **正确的类型声明映射** - 类型和实现格式一致
- ✅ **现代化的包配置** - 符合 Node.js 和 TypeScript 最新标准
- ✅ **工具链验证通过** - `@arethetypeswrong/cli` 检查无问题

这个修复确保了 `lib-starter` 模板生成的包能够在各种 Node.js 环境和构建工具中正常工作，为用户提供最佳的开发体验！🚀
