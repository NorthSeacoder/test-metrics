import { defineConfig } from 'tsup'

export default defineConfig([
  // 库入口
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
    sourcemap: true,
    clean: true,
    splitting: false,
    target: 'es2022',
    outDir: 'dist',
    treeshake: true,
    minify: false, // 库不需要压缩，让使用者决定
    cjsInterop: true, // 改善 CJS 兼容性
  },
  // CLI 入口
  {
    entry: ['src/cli/run.ts'],
    format: ['cjs'], // CLI 只使用 CommonJS 避免 ESM 兼容性问题
    dts: true,
    sourcemap: true,
    splitting: false,
    target: 'es2022',
    outDir: 'dist/cli',
    treeshake: true,
    minify: false,
    cjsInterop: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
    // CLI 需要打包所有依赖
    noExternal: ['chalk', 'commander'],
  },
])
