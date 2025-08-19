# test-metrics - CI 测试度量分析工具（Monorepo 支持）

## 1. 背景与目标

- 当前评审流程：Phabricator + arc，CI 构建阶段已有完整的环境变量支持。
- 目标：专为 CI 构建阶段设计，分析已生成的测试覆盖率报告，充分利用 CI 环境变量（项目范围、分支、提交等），计算测试指标与补丁覆盖率，并通过既有接口上报；输出人类可读摘要与机器可读 JSON。
- 优化点：工具作为单一 CLI 命令（`test-metrics`/`tm`），专注分析覆盖率文件而非执行测试；自动探测 CI 环境与受影响项目；配置文件（`.test-metrics.config.*`）支持阈值与路径过滤。

## 2. 范围与不做

- 范围：分析已生成的测试覆盖率报告（json-summary/lcov等）；充分利用 CI 环境变量；支持 monorepo 多包聚合；自动上报到既有接口。
- 不做：不执行测试（由测试框架负责）；不考虑本地/Git hook 场景；不阻塞提交流程；不做跨机器看板（仅上报）；不处理依赖安装。
- 优化点：支持任何生成标准覆盖率格式的测试框架；兼容 Yarn/Pnpm 工作区；CI 环境变量自动探测。

## 3. 用户与场景

- CI 构建阶段工作流：
  1. 测试框架执行：`npm run test -- --coverage` 生成覆盖率报告
  2. 工具自动分析：`npx test-metrics` 分析报告并上报
- 自动识别受影响项目：通过 CI 环境变量直接获取变更范围，无需手动指定。
- 支持全量与增量模式：`--full` 分析全仓库，默认基于 CI 提供的变更范围。
- 自动上报：解析覆盖率后通过既有接口上报，支持补丁覆盖率门禁。

## 4. 指标定义（首期必采集 + 建议增强）

- 首期必采集（MVP）
  - 项目维度
    - 项目名：环境变量
    - 受影响包列表：环境变量
  - 用例维度
    - 用例总数（total）、通过数（passed）、失败数（failed）、跳过数（skipped，若可得）
    - 失败文件数（failing test files count）
    - 优化点：添加 flaky 测试检测（若 Vitest 支持重跑，统计重跑后通过的用例数）
  - 覆盖率维度（整体）
    - 覆盖率百分比：优先顺序 `statements > lines > functions > branches`（取第一个可用）
    - 同时输出 4 项明细（若可得）：statements/lines/functions/branches 的 pct
    - 优化点：添加阈值检查（例如，覆盖率 < 80% 时在人类可读输出中高亮警告，可通过配置自定义阈值）
  - 时长维度
    - 本次统计开始/结束时间戳
    - 测试总耗时（ms）（若可得，包内与聚合）
    - 优化点：添加 CPU/内存峰值使用（若 Node 支持简单采集，如通过 `process.memoryUsage()`）
  - 结果摘要
    - 首个失败的错误信息摘要（Top-1，便于快速定位）
    - 优化点：扩展到 Top-3 失败摘要，并链接到失败文件路径（相对仓库根）
  - 运行环境
    - Node 版本、Vitest 版本、OS（平台/架构）
    - 优化点：添加 Git 版本、包管理器类型（npm/yarn/pnpm）和当前分支名

- 建议增强（可二期逐步增加）
  - 变更覆盖率（Diff Coverage）
    - 对本次提交变更的文件/行的专属覆盖率（需要解析覆盖率映射/LCOV）；集成 Istanbul 或类似工具解析 diff。
  - 覆盖率细化
    - 按包/按文件的覆盖率 TopN（最低覆盖文件 TopN）
    - 覆盖率与基线（主分支）对比增减（Delta），通过 git fetch 主分支并比较。
  - 性能细化
    - 最慢测试文件 TopN（按 duration）
    - 失败/重跑后通过的可疑（Flaky）用例 TopN（需重跑或历史数据）
  - 测试健康度
    - 跳过用例数（skipped）与占比
    - 断言数量（若 JSON 提供）
    - 快照统计（总数/新增/过期，若使用 snapshot）
  - 产能/规模
    - 测试密度：每千行代码用例数（tests per KLoC），通过 cloc 或简单行数统计。
  - 可追溯性
    - 提交哈希、分支名、作者、提交时间
    - 优化点：添加提交消息摘要（前 50 字符）

## 5. 输出格式

- 控制台人类可读摘要（单包 or 多包聚合 + 明细），使用彩色输出（e.g., chalk 库）以高亮失败/警告。
- 机器可读 JSON（用于 CI/后续上报），示例（优化后添加更多字段）：

```json
{
  "projects": ["@yqg/slimfit"],
  "totals": { "tests": 42, "passed": 40, "failed": 2, "skipped": 0 },
  "coverage": {
    "metric": "statements",
    "pct": 87.65,
    "details": { "statements": 87.65, "lines": 86.2, "functions": 88.0, "branches": 79.3 },
    "thresholdWarning": false
  },
  "durationMs": 8123,
  "startedAt": "2025-08-14T03:12:45.123Z",
  "finishedAt": "2025-08-14T03:12:53.246Z",
  "env": {
    "node": "v18.20.2",
    "vitest": "3.1.4",
    "os": "darwin-arm64",
    "branch": "main",
    "commitHash": "abc123"
  },
  "details": [
    {
      "project": "@yqg/slimfit",
      "tests": { "total": 42, "passed": 40, "failed": 2, "skipped": 0 },
      "coverage": {
        "metric": "statements",
        "pct": 87.65,
        "details": { "statements": 87.65, "lines": 86.2, "functions": 88.0, "branches": 79.3 }
      },
      "durationMs": 8123,
      "failingFiles": 1,
      "firstError": "should render disabled state: expected true to be false",
      "topErrors": ["error1", "error2", "error3"]
    }
  ]
}
```

- 优化点：添加 `--json-only` 标志仅输出 JSON（静默人类输出）；支持输出到文件（如 `--output <file.json>`）但默认不落盘。

## 6. 变更范围识别（CI 环境变量优先）

- CI 环境变量：优先使用 `CI_CHANGED_FILES`、`GITHUB_CHANGED_FILES` 等 CI 提供的变更文件列表
- Git fallback：若无 CI 变量，回退到 `git diff --name-only --diff-filter=ACMR $BASE_SHA..$HEAD_SHA`
- 过滤无关：`node_modules/`、`dist/`、`coverage/` 等（可配置）
- 优化点：支持 `--include <patterns>` 和 `--exclude <patterns>` CLI 选项覆盖默认过滤。

## 7. 包定位策略

- 对每个改动文件向上查找最近 `package.json` 作为包根；聚合去重。
- 若集合为空，退化为仓库根目录（单包）。
- 优化点：缓存包根映射以加速多次执行；处理嵌套包场景，确保不重复统计。

## 8. 分析与处理

- CI 构建阶段专用，分析已生成的覆盖率报告文件。
- 自动查找覆盖率文件：`coverage/coverage-summary.json`、`coverage/lcov.info` 等。
- 多包并发分析：基于 CI 资源自动调整并发数。
- 优化点：流式解析大文件；智能缓存；超时保护机制。

## 9. 覆盖率文件处理

- 自动探测覆盖率文件：优先 `coverage-summary.json`，fallback 到 `lcov.info`。
- 支持多种测试框架：Vitest、Jest、Mocha + nyc 等生成的标准格式。
- 文件清理：分析完成后自动清理覆盖率文件，保持 CI 环境整洁。
- 优化点：智能格式检测；多格式兼容；错误恢复机制。

## 10. 产物与清理

- 临时文件写入系统临时目录（`os.tmpdir()`）；默认执行完清理，`--keep` 可保留排查。
- 仓库根不落产物，不污染版本库。
- 自动清理覆盖率文件：分析完成后删除 `coverage/` 目录。
- 优化点：添加 `--dry-run` 模式，仅模拟分析；确保清理时处理权限问题。

## 11. 错误与边界

- 某包分析失败不影响其他包；最终输出包含失败摘要与建议。
- 无覆盖率文件时，输出友好提示并退出。
- 格式不支持时，尝试其他格式或给出明确错误信息。
- 优化点：全局错误日志；友好错误提示；可选错误上报。

## 12. 性能目标

- 工具自身开销 < 200ms；分析耗时主要取决于覆盖率文件大小。
- CI 构建阶段：充分利用 CI 资源，支持并发分析；可选择全量或变更范围。
- 优化点：性能 profiling 输出各阶段耗时；流式解析大文件；CI 环境变量减少 Git 调用。

## 13. 验收标准

- CI 环境变量探测：自动识别 GitHub Actions/GitLab CI/Jenkins 等，获取分支、提交、PR 信息。
- 变更范围识别：优先使用 CI 提供的文件列表，正确识别受影响包。
- 覆盖率文件分析：自动查找并解析 json-summary/lcov 格式，输出四项明细。
- 多包聚合：并发分析多包，聚合统计正确（用例求和、覆盖率加权平均）。
- 补丁覆盖率：基于 CI 基线分支计算变更行覆盖率。
- 自动上报：解析为统一 JSON 格式，通过既有接口上报成功。
- 阈值门禁：总覆盖率与补丁覆盖率检查，失败时正确退出码。

## 14. 里程碑

- 阶段 1：CI 环境探测、变更范围识别、包定位、覆盖率文件查找。
- 阶段 2：覆盖率解析、补丁覆盖率计算、聚合统计。
- 阶段 3：上报接口集成、阈值门禁、错误处理。
- 阶段 4：并发优化、配置文件支持、CI 示例完善。

## 15. 技术架构与模块划分

- CLI 入口：`bin/test-metrics`（Node.js + TypeScript）。
- 核心模块：
  - `ci-detector`：识别 CI 环境，收集分支、提交哈希、PR 编号、变更文件列表等。
  - `change-resolver`：优先使用 CI 环境变量，fallback 到 Git diff 获取变更范围。
  - `workspace-resolver`：定位受影响包（向上查找 `package.json`），支持 npm/yarn/pnpm 工作区。
  - `coverage-finder`：自动查找覆盖率文件，支持多种格式和路径。
  - `coverage-parsers`：解析 `json-summary`、`lcov` 等格式，统一为内部模型。
  - `patch-analyzer`：基于 CI 基线计算补丁覆盖率（变更行级别）。
  - `aggregator`：多包聚合，计算总体与分包指标。
  - `threshold-gate`：阈值门禁检查，支持总覆盖率与补丁覆盖率。
  - `uploader`：统一 JSON 格式上报，幂等重试。
  - `renderer`：控制台输出与 JSON 格式化。

依赖建议：

- 覆盖率解析：`istanbul-lib-coverage`、`lcov-parse`、`xml2js` 或 `fast-xml-parser`。
- Git：`simple-git`（或直接 `child_process.execFile('git', ...)`）。
- CLI：`commander`/`yargs`，着色 `picocolors`，路径匹配 `globby`。
- 工具：`zod` 做配置/上报 JSON 校验；`p-limit` 控并发。

## 16. CLI 设计与参数

- 可执行名：`test-metrics`（别名：`tm`）。
- 主命令：`test-metrics` 或 `tm`（自动探测 CI 环境并执行完整分析流程）。
- 常用参数：
  - `--full`：忽略变更范围，分析全仓库覆盖率。
  - `--format <auto|json-summary|lcov>`：覆盖率格式，默认 `auto` 自动探测。
  - `--upload`：启用上报（CI 环境默认开启）。
  - `--json-only`：仅输出机器可读 JSON，静默控制台输出。
  - `--config <path>`：指定配置文件路径。
  - `--keep`：保留覆盖率文件，不自动清理。
  - `--debug`：开启调试模式，输出详细日志。
- 环境变量覆写：
  - `--commit <sha>`、`--branch <name>`、`--pr <number>`：覆盖 CI 自动探测。
  - `--base <branch|sha>`：补丁覆盖率基线，覆盖 CI 默认。
- 退出码：
  - 0：分析成功且上报成功；
  - 1：工具错误（参数/环境/解析失败）；
  - 2：覆盖率文件缺失或格式错误；
  - 3：阈值门禁失败（上报已完成）；
  - 10：上报失败（网络/鉴权）。

## 17. 配置文件（.test-metrics.config.\*）

- 支持：`.test-metrics.config.json`、`test-metrics.config.js`（仓库根目录）。
- 字段（CI 优化版）：

```json
{
  "$schema": "https://example.com/schemas/test-metrics.schema.json",
  "ci": {
    "providers": ["github-actions", "gitlab-ci", "jenkins"],
    "changedFilesEnvs": ["GITHUB_CHANGED_FILES", "CI_CHANGED_FILES"]
  },
  "coverage": {
    "formats": ["json-summary", "lcov"],
    "globs": ["**/coverage/coverage-summary.json", "**/coverage/lcov.info"],
    "prefer": ["statements", "lines", "functions", "branches"]
  },
  "thresholds": {
    "total": { "statements": 80, "branches": 70 },
    "patch": { "lines": 90 }
  },
  "monorepo": {
    "packageRoots": ["packages/*", "apps/*"],
    "concurrency": "auto",
    "timeoutMs": 300000
  },
  "upload": {
    "enabled": true,
    "endpointEnv": "METRICS_UPLOAD_URL",
    "tokenEnv": "METRICS_TOKEN",
    "gzip": true
  }
}
```

- 解析策略：CLI 参数 > 配置文件 > CI 环境变量 > 默认值。

## 20. 覆盖率输入与解析

- 支持格式与默认查找顺序：
  1. Istanbul `coverage-summary.json`（优先，解析稳定、体积小）；
  2. `lcov.info`；
  3. `cobertura.xml`（coverage.py/多语言常见）；
  4. `jacoco.xml`（Java）；
  5. Go `coverprofile`（`mode: set|count|atomic`）；
  6. 其他（可扩展）。
- 统一模型：
  - 文件级：`{ path, statements: {covered,total}, lines, functions, branches }`。
  - 聚合级：同字段总和后计算 `pct = covered/total*100`（避免平均百分比带来的偏差）。
- 路径归一化：
  - 统一相对仓库根；将 Windows `\\` 转 `/`；去除构建时前缀；支持 `sourceRootHints` 做源映射回溯。
  - 忽略匹配 `node_modules/**`、生成物目录（可配置）。

## 18. 补丁覆盖率（CI 基线优化）

算法步骤：

1. 基线获取：优先使用 CI 环境变量 `BASE_SHA`、`GITHUB_BASE_REF` 等。
2. 变更行提取：`git diff --unified=0 --no-color $BASE_SHA...$HEAD_SHA`，解析新增/修改行号。
3. 覆盖率对齐：将变更行与覆盖率报告的行级数据匹配。
4. 补丁覆盖率：`coveredPatchLines / totalPatchLines * 100`。
5. 边界处理：删除文件忽略；重命名文件追踪；大 diff 降级处理。

## 19. Monorepo 聚合与 CI 优化

- 包定位：基于 CI 变更文件列表，向上查找 `package.json`，去重形成包列表。
- 并发执行：基于 CI 资源自动调整并发数，失败包不影响其他包。
- 聚合规则：加权汇总覆盖率（避免平均误差），生成 `byFile` 低覆盖 TOP N。

## 20. 上报集成（既有接口）

- 约定环境变量：
  - `METRICS_UPLOAD_URL`：既有上报接口地址（必填）。
  - `METRICS_TOKEN`：鉴权 Token（必填）。
  - `METRICS_UPLOAD_RAW`：`true|false`，是否连同原始报告上传（默认 `false`）。
  - `METRICS_TIMEOUT_MS`：上报超时（默认 15000ms）。
- 上报内容：
  - 主体：统一摘要 JSON（包含 repo/branch/commit/pr/ci、totals、details、patch、byFile）。
  - 可选：原始报告文件（`multipart/form-data` 或 先压缩为 `.tar.gz` 单文件字段）。
- 可靠性：
  - Gzip 压缩；请求重试（指数退避，最多 3 次）；
  - 幂等键：`<repo>@<commit>#<ciRunId>`；
  - 体积限制与裁剪策略：超过阈值时仅保留摘要与 byFile TopN。
- 参考命令（示意，具体字段以既有接口为准）：

```bash
test-metrics --format auto --upload \
  --base origin/main --commit "$GIT_COMMIT" --branch "$GIT_BRANCH" --pr "$PR_NUMBER"
```

## 21. CI 集成示例

### GitHub Actions

```yaml
name: test-coverage-metrics
on: [pull_request, push]
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 获取完整历史用于 diff
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run test -- --coverage # 生成覆盖率报告
      - run: npx test-metrics # 分析并上报
        env:
          METRICS_UPLOAD_URL: ${{ secrets.METRICS_UPLOAD_URL }}
          METRICS_TOKEN: ${{ secrets.METRICS_TOKEN }}
```

### GitLab CI

```yaml
stages: [test]
coverage-metrics:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run test -- --coverage
    - npx test-metrics --full
  variables:
    METRICS_UPLOAD_URL: $METRICS_UPLOAD_URL
    METRICS_TOKEN: $METRICS_TOKEN
```

## 22. 安全、稳定性与性能

- 安全：Token 仅从环境变量读取；日志脱敏；CI 环境隔离。
- 稳定性：网络重试；单包失败隔离；超时保护。
- 性能：工具开销 < 200ms；CI 资源感知并发；流式解析大文件。
- 观测：关键阶段耗时统计；`--debug` 详细日志。

## 23. 技术落地清单

1. **MVP**：CI 环境探测 → 变更文件获取 → 包定位 → 覆盖率文件查找 → 覆盖率解析。
2. **核心功能**：补丁覆盖率计算 → 聚合统计 → 阈值门禁 → 上报集成。
3. **优化增强**：并发分析 → 配置文件 → 错误处理 → 性能调优。
4. **验收部署**：CI 示例 → 试点仓库 → 门禁效果观察 → 全量推广。

## 24. 统一摘要 JSON（CI 优化版）

```json
{
  "repo": "org/repo",
  "commit": "abcdef123",
  "branch": "feature/x",
  "prNumber": 42,
  "ci": "github-actions",
  "generator": "test-metrics@1.0.0",
  "changedFiles": ["packages/a/src/foo.ts", "packages/b/test/bar.test.ts"],
  "affectedPackages": ["@org/package-a", "@org/package-b"],
  "summary": {
    "lines": { "covered": 1200, "total": 1500, "pct": 80.0 },
    "statements": { "covered": 1350, "total": 1700, "pct": 79.41 },
    "functions": { "covered": 300, "total": 360, "pct": 83.33 },
    "branches": { "covered": 210, "total": 300, "pct": 70.0 }
  },
  "patch": { "linesPct": 91.0, "branchesPct": 85.0, "coveredLines": 182, "totalLines": 200 },
  "totals": { "tests": 420, "passed": 410, "failed": 10, "skipped": 0 },
  "byPackage": [{ "name": "@org/package-a", "linesPct": 85.0, "patchPct": 90.0, "tests": 200 }],
  "threshold": {
    "totalPass": true,
    "patchPass": true,
    "details": { "statements": 80, "patch": 90 }
  },
  "durationMs": 8123,
  "env": { "node": "v20.15.0", "vitest": "1.6.0", "ci": "github-actions" }
}
```

## 25. 约束与不做

- 专为 CI 构建阶段设计，不考虑本地/Git hook 场景。
- 仅分析覆盖率报告，不执行测试（由测试框架负责）。
- 仅通过既有接口上报，不实现后端存储。
- 首期专注 json-summary/lcov 格式，其他格式延后。
- 不向仓库落盘产物，保持 CI 环境清洁。
