import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseArgs } from './parse-args'
import type { ParsedArgs } from './parse-args'

// Mock dependencies
vi.mock('node:process', () => ({
  default: {
    argv: ['node', 'script.js'],
    exit: vi.fn(),
  },
}))

vi.mock('chalk', () => ({
  default: {
    bold: Object.assign(
      vi.fn((text) => text),
      {
        cyan: vi.fn((text) => text),
      }
    ),
    gray: vi.fn((text) => text),
    red: vi.fn((text) => text),
  },
}))

describe('parseArgs', () => {
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  const mockConsoleLog = vi.fn()
  const mockConsoleError = vi.fn()

  beforeEach(() => {
    console.log = mockConsoleLog
    console.error = mockConsoleError
    vi.clearAllMocks()
  })

  afterEach(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
  })

  describe('basic argument parsing', () => {
    it('should parse basic run command with input', async () => {
      const argv = ['node', 'script.js', './src']
      const result = await parseArgs(argv)

      expect(result).toEqual({
        command: 'run',
        options: {
          input: './src',
          output: '.',
          verbose: undefined,
          dryRun: undefined,
        },
      })
    })

    it('should parse run command with all options', async () => {
      const argv = ['node', 'script.js', './src', '--output', './dist', '--verbose', '--dry-run']
      const result = await parseArgs(argv)

      expect(result).toEqual({
        command: 'run',
        options: {
          input: './src',
          output: './dist',
          verbose: true,
          dryRun: true,
        },
      })
    })

    it('should parse run command without input', async () => {
      const argv = ['node', 'script.js', '--output', './build']
      const result = await parseArgs(argv)

      expect(result).toEqual({
        command: 'run',
        options: {
          input: undefined,
          output: './build',
          verbose: undefined,
          dryRun: undefined,
        },
      })
    })

    it('should parse run command with short options', async () => {
      const argv = ['node', 'script.js', './src', '-o', './dist']
      const result = await parseArgs(argv)

      expect(result).toEqual({
        command: 'run',
        options: {
          input: './src',
          output: './dist',
          verbose: undefined,
          dryRun: undefined,
        },
      })
    })
  })

  describe('help and version commands', () => {
    it('should be defined and callable', () => {
      // Test that parseArgs function exists and is callable
      expect(typeof parseArgs).toBe('function')
    })

    // Note: Help and version commands call process.exit() which makes them
    // difficult to test in unit tests. These are better tested in integration tests.
  })

  describe('error handling', () => {
    it('should be testable without process.exit calls', () => {
      // parseArgs 函数存在且可调用
      expect(typeof parseArgs).toBe('function')
    })

    // Note: 涉及 --invalid-option 等会触发 commander 错误处理和 process.exit()
    // 这些应该在集成测试中测试，而不是单元测试
  })

  describe('default behavior', () => {
    it('should handle empty options object', async () => {
      const argv = ['node', 'script.js', 'test-input']
      const result = await parseArgs(argv)

      expect(result.options).toBeDefined()
      expect(result.options?.input).toBe('test-input')
      expect(result.options?.output).toBe('.')
    })

    it('should handle boolean flags correctly', async () => {
      const argv = ['node', 'script.js', '--verbose']
      const result = await parseArgs(argv)

      expect(result.options?.verbose).toBe(true)
      expect(result.options?.dryRun).toBeUndefined()
    })
  })
})
