# Codecov 配置指南 / Codecov Configuration Guide

## 🎯 **Token 类型选择**

### **Repository Token vs Global Token**

| 特性           | Repository Token    | Global Token        |
| -------------- | ------------------- | ------------------- |
| **适用场景**   | 单个仓库            | 多个仓库管理        |
| **权限范围**   | 仅限当前仓库        | 组织下所有仓库      |
| **安全性**     | ✅ 高（权限最小化） | ⚠️ 中等（权限较大） |
| **配置复杂度** | 每个仓库单独配置    | 一次配置多处使用    |
| **推荐使用**   | 个人项目、单一仓库  | 组织项目、多仓库    |

## 🔧 **Global Token 配置步骤**

### **1. 获取 Global Token**

```bash
# 1. 访问 Codecov
https://codecov.io

# 2. 登录 GitHub 账号

# 3. 进入组织设置
点击右上角头像 → Organizations → 选择你的组织

# 4. 获取 Global Token
Settings → Global Upload Token → Copy Token
```

### **2. 配置 GitHub Secrets**

```bash
# GitHub Repository Settings
Settings → Secrets and variables → Actions → New repository secret

Name: CODECOV_TOKEN
Value: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### **3. GitHub Actions 配置**

当前的 CI 配置已经支持 Global Token：

```yaml
# .github/workflows/ci.yml
- name: Upload coverage to Codecov
  if: matrix.os == 'ubuntu-latest' && matrix.node-version == 20
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    file: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
```

## ⚠️ **Global Token 注意事项**

### **1. 仓库名称大小写问题**

```bash
# 确保仓库名称与 GitHub 完全一致
# 错误示例：GitHub 仓库名为 "MyRepo"，但 Codecov 识别为 "myrepo"
# 解决方案：检查 Codecov 仪表板中的仓库名称是否正确
```

### **2. 权限管理**

```bash
# Global Token 具有组织级权限，建议：
# - 定期轮换 Token
# - 监控 Token 使用情况
# - 限制 Token 访问范围（如果 Codecov 支持）
```

### **3. 故障排除**

#### **常见错误：Repository not found**

```bash
# 原因：仓库名称大小写不匹配
# 解决方案：
1. 检查 GitHub 仓库的实际名称
2. 确保 Codecov 中的仓库名称完全一致
3. 如果需要，在 Codecov 中手动添加仓库
```

#### **常见错误：Token invalid**

```bash
# 原因：Token 过期或权限不足
# 解决方案：
1. 重新生成 Global Token
2. 更新 GitHub Secrets 中的 CODECOV_TOKEN
3. 确保 Token 具有组织级权限
```

## 📊 **配置验证**

### **1. 本地验证**

```bash
# 生成覆盖率报告
npm run test:coverage

# 检查覆盖率文件
ls -la coverage/
# 应该看到：lcov.info, coverage-final.json 等文件
```

### **2. CI 验证**

```bash
# 推送代码触发 CI
git add .
git commit -m "test: verify codecov integration"
git push origin main

# 检查 GitHub Actions 日志
# 查看 "Upload coverage to Codecov" 步骤是否成功
```

### **3. Codecov 仪表板验证**

```bash
# 访问 Codecov 仪表板
https://codecov.io/gh/your-org/your-repo

# 检查：
# - 覆盖率报告是否正常显示
# - 覆盖率百分比是否正确
# - 文件覆盖率详情是否可用
```

## 🎯 **最佳实践**

### **1. 覆盖率目标设置**

```yaml
# codecov.yml (可选配置文件)
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 1%
    patch:
      default:
        target: 80%
```

### **2. 忽略文件配置**

```yaml
# codecov.yml
coverage:
  ignore:
    - 'dist/'
    - 'coverage/'
    - '**/*.test.ts'
    - '**/*.config.js'
```

### **3. 多环境支持**

```yaml
# GitHub Actions 中的标记
- name: Upload coverage to Codecov
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    flags: unittests,node${{ matrix.node-version }}
    env_vars: OS,NODE
```

## 🔄 **迁移指南**

### **从 Repository Token 迁移到 Global Token**

```bash
# 1. 获取 Global Token（按上述步骤）

# 2. 更新 GitHub Secrets
# 保持 Secret 名称不变：CODECOV_TOKEN
# 只需要更新 Value 为新的 Global Token

# 3. 无需修改 GitHub Actions 配置
# 现有配置自动兼容 Global Token

# 4. 验证迁移结果
# 推送代码，检查 Codecov 上传是否正常
```

## 🆘 **故障排除清单**

### **上传失败时的检查步骤**

```bash
# 1. 检查 Token 配置
echo ${{ secrets.CODECOV_TOKEN }} # 在 Actions 中检查（注意安全）

# 2. 检查覆盖率文件
ls -la coverage/lcov.info

# 3. 检查网络连接
curl -f https://codecov.io/

# 4. 检查 Codecov Action 版本
# 确保使用最新版本：codecov/codecov-action@v5

# 5. 检查仓库权限
# 确保 Global Token 对当前仓库有权限
```

---

使用 Global Token 可以简化多仓库的 Codecov 配置，但需要注意权限管理和安全性。按照本指南配置，你的覆盖率报告应该能够正常上传到 Codecov。🚀
