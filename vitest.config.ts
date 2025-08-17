import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'test/',
        '**/*.{test,spec}.{js,ts}',
        '**/*.config.{js,ts}',
        '**/types/**',
        'bin/**',
        // 排除不需要测试的文件
        'src/index.ts', // 纯导出文件
        'src/cli/run.ts', // 简单入口文件
        'src/cli/exit-code.ts', // 常量定义
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    testTimeout: 30000, // E2E 测试需要更长时间
    hookTimeout: 10000,
  },
})
