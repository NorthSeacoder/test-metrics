import { describe, it, expect, beforeAll } from 'vitest'
import { execa } from 'execa'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '../..')
const cliPath = join(projectRoot, 'bin/starter.cjs')

describe('CLI E2E Tests', () => {
  beforeAll(async () => {
    // 确保项目已构建
    await execa('npm', ['run', 'build'], { cwd: projectRoot })
  })

  describe('Basic Commands', () => {
    it('should show version', async () => {
      const { stdout, exitCode } = await execa('node', [cliPath, '--version'])

      expect(exitCode).toBe(0)
      expect(stdout.trim()).toBe('0.0.0')
    })

    it('should show help', async () => {
      const { stdout, exitCode } = await execa('node', [cliPath, '--help'])

      expect(exitCode).toBe(0)
      expect(stdout).toContain('Usage:')
      expect(stdout).toContain('starter')
    })

    it('should show help when no arguments provided', async () => {
      const { stdout, exitCode } = await execa('node', [cliPath])

      expect(exitCode).toBe(0)
      expect(stdout).toContain('用法:') // 中文版本的 "Usage:"
      expect(stdout).toContain('starter')
    })
  })

  describe('Run Command', () => {
    it('should execute run command with basic options', async () => {
      const { stdout, exitCode } = await execa('node', [
        cliPath,
        './src',
        '--output',
        './test-output',
        '--dry-run',
      ])

      expect(exitCode).toBe(0)
      expect(stdout).toContain('✅ 操作成功完成')
    })

    it('should show verbose output when requested', async () => {
      const { stdout, exitCode } = await execa('node', [cliPath, './src', '--verbose', '--dry-run'])

      expect(exitCode).toBe(0)
      expect(stdout).toContain('🚀 Starter')
      expect(stdout).toContain('TypeScript Library Development Tool')
      expect(stdout).toContain('版本: 0.0.0')
    })

    it('should handle short options', async () => {
      const { stdout, exitCode } = await execa('node', [
        cliPath,
        './src',
        '-o',
        './test-output',
        '--dry-run',
      ])

      expect(exitCode).toBe(0)
      expect(stdout).toContain('✅ 操作成功完成')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid options gracefully', async () => {
      try {
        await execa('node', [cliPath, '--invalid-option'])
      } catch (error: any) {
        expect(error.exitCode).toBe(1)
        expect(error.stderr).toContain('unknown option')
      }
    })

    it('should provide helpful error messages', async () => {
      // 测试不存在的输入路径
      try {
        await execa('node', [cliPath, './non-existent-path'])
      } catch (error: any) {
        // CLI 应该优雅地处理错误并提供有用的信息
        expect(error.exitCode).toBe(1)
        // 具体的错误信息取决于 starter 函数的实现
      }
    })
  })

  describe('Integration', () => {
    it('should work with all options combined', async () => {
      const { stdout, exitCode } = await execa('node', [
        cliPath,
        './src',
        '--output',
        './test-output',
        '--verbose',
        '--dry-run',
      ])

      expect(exitCode).toBe(0)
      expect(stdout).toContain('🚀 Starter') // verbose mode
      expect(stdout).toContain('✅ 操作成功完成') // success message
    })
  })
})
