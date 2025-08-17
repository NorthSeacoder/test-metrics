import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  main,
  handleCommand,
  executeRunCommand,
  formatWelcomeMessage,
  formatRunResult,
  formatError,
  type CliDependencies,
} from './index'
import { ExitCode } from './exit-code'

describe('CLI Functions', () => {
  // Mock functions with proper typing
  const mockParseArgs = vi.fn()
  const mockStarterAsync = vi.fn()
  const mockClassifyError = vi.fn()
  const mockConsoleLog = vi.fn()
  const mockConsoleError = vi.fn()
  const mockExit = vi.fn()

  const mockDeps: CliDependencies = {
    parseArgs: mockParseArgs,
    starterAsync: mockStarterAsync,
    classifyError: mockClassifyError,
    console: {
      log: mockConsoleLog,
      error: mockConsoleError,
    } as Console,
    exit: mockExit as any,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('formatWelcomeMessage', () => {
    it('should format welcome message correctly', () => {
      const message = formatWelcomeMessage()

      expect(message).toContain('🚀 Starter')
      expect(message).toContain('TypeScript Library Development Tool')
      expect(message).toContain('版本: 0.0.0')
    })
  })

  describe('formatRunResult', () => {
    it('should format success result', () => {
      const result = formatRunResult({
        success: true,
        message: 'All done!',
      })

      expect(result.successMessage).toContain('✅ 操作成功完成')
      expect(result.details).toContain('All done!')
    })

    it('should format error result', () => {
      const result = formatRunResult({
        success: false,
        message: 'Something went wrong',
      })

      expect(result.errorMessage).toContain('❌ 操作失败')
      expect(result.details).toContain('Something went wrong')
    })

    it('should handle result without message', () => {
      const successResult = formatRunResult({ success: true })
      const errorResult = formatRunResult({ success: false })

      expect(successResult.details).toBeUndefined()
      expect(errorResult.details).toBeUndefined()
    })
  })

  describe('formatError', () => {
    it('should format error with suggestions', () => {
      mockClassifyError.mockReturnValue({
        type: 'validation',
        message: '参数错误',
        suggestions: ['检查参数格式', '查看帮助文档'],
      })

      const result = formatError(new Error('Test error'), mockClassifyError)

      expect(result.message).toContain('💥 操作失败')
      expect(result.message).toContain('参数错误')
      expect(result.suggestions).toContain('💡 建议解决方案')
      expect(result.suggestions).toContain('检查参数格式')
    })

    it('should include debug info in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      mockClassifyError.mockReturnValue({
        type: 'unknown',
        message: '未知错误',
        suggestions: [],
      })

      const result = formatError(new Error('Test error'), mockClassifyError)

      expect(result.debugInfo).toContain('🔍 调试信息')
      expect(result.debugInfo).toContain('Test error')

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('handleCommand', () => {
    it('should handle run command', async () => {
      const options = { input: './src', verbose: true }
      mockStarterAsync.mockResolvedValue({ success: true, message: 'Done' })

      const result = await handleCommand('run', options, mockDeps)

      expect(result.shouldExit).toBe(false)
      expect(result.exitCode).toBe(ExitCode.Success)
    })

    it('should handle version command', async () => {
      const result = await handleCommand('version', null, mockDeps)

      expect(mockConsoleLog).toHaveBeenCalledWith('0.0.0')
      expect(result.shouldExit).toBe(true)
      expect(result.exitCode).toBe(ExitCode.Success)
    })

    it('should handle help command', async () => {
      const result = await handleCommand('help', null, mockDeps)

      expect(result.shouldExit).toBe(true)
      expect(result.exitCode).toBe(ExitCode.Success)
    })
  })

  describe('executeRunCommand', () => {
    it('should execute run command successfully', async () => {
      const options = { input: './src', verbose: false }
      mockStarterAsync.mockResolvedValue({
        success: true,
        message: 'Operation completed',
      })

      await executeRunCommand(options, mockDeps)

      expect(mockStarterAsync).toHaveBeenCalledWith(options)
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('✅ 操作成功完成'))
    })

    it('should show welcome message in verbose mode', async () => {
      const options = { verbose: true }
      mockStarterAsync.mockResolvedValue({ success: true })

      await executeRunCommand(options, mockDeps)

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('🚀 Starter'))
    })

    it('should handle run command failure', async () => {
      const options = { input: './src' }
      mockStarterAsync.mockResolvedValue({
        success: false,
        message: 'Operation failed',
      })

      await expect(executeRunCommand(options, mockDeps)).rejects.toThrow('Operation failed')

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('❌ 操作失败'))
    })
  })

  describe('main', () => {
    it('should handle successful run command', async () => {
      mockParseArgs.mockResolvedValue({
        command: 'run',
        options: { input: './src' },
      })
      mockStarterAsync.mockResolvedValue({ success: true })

      await main(mockDeps)

      expect(mockParseArgs).toHaveBeenCalled()
      expect(mockStarterAsync).toHaveBeenCalled()
      expect(mockExit).not.toHaveBeenCalled()
    })

    it('should exit for version command', async () => {
      mockParseArgs.mockResolvedValue({
        command: 'version',
        options: null,
      })

      await main(mockDeps)

      expect(mockConsoleLog).toHaveBeenCalledWith('0.0.0')
      expect(mockExit).toHaveBeenCalledWith(ExitCode.Success)
    })

    it('should handle parsing errors', async () => {
      mockParseArgs.mockRejectedValue(new Error('Parsing failed'))
      mockClassifyError.mockReturnValue({
        type: 'validation',
        message: '参数解析失败',
        suggestions: ['检查命令格式'],
      })

      await main(mockDeps)

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('💥 操作失败'))
      expect(mockExit).toHaveBeenCalledWith(ExitCode.FatalError)
    })
  })
})
