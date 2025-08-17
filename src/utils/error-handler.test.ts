import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  safeSync,
  safeAsync,
  safeReadFile,
  safeParseJSON,
  safeBatch,
  classifyError,
  StarterError,
  type ErrorContext,
} from './error-handler'

describe('error-handler', () => {
  const mockContext: ErrorContext = {
    operation: '测试操作',
    filePath: '/test/file.txt',
  }

  // Mock environment variables
  const originalEnv = process.env
  const mockConsoleWarn = vi.fn()

  beforeEach(() => {
    console.warn = mockConsoleWarn
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
    mockConsoleWarn.mockClear()
  })

  describe('safeSync', () => {
    it('should return result when operation succeeds', () => {
      const result = safeSync(() => 'success', mockContext, 'fallback')
      expect(result).toBe('success')
    })

    it('should return fallback when operation fails', () => {
      const result = safeSync(
        () => {
          throw new Error('test error')
        },
        mockContext,
        'fallback'
      )
      expect(result).toBe('fallback')
    })
  })

  describe('safeAsync', () => {
    it('should return result when operation succeeds', async () => {
      const result = await safeAsync(() => Promise.resolve('success'), mockContext, 'fallback')
      expect(result).toBe('success')
    })

    it('should return fallback when operation fails', async () => {
      const result = await safeAsync(
        () => Promise.reject(new Error('test error')),
        mockContext,
        'fallback'
      )
      expect(result).toBe('fallback')
    })

    it('should log warning in development mode', async () => {
      process.env.NODE_ENV = 'development'

      await safeAsync(() => Promise.reject(new Error('test error')), mockContext, 'fallback')

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[测试操作] 操作失败:',
        'test error',
        '文件: /test/file.txt'
      )
    })

    it('should log warning in debug mode', async () => {
      process.env.DEBUG = 'true'

      await safeAsync(() => Promise.reject(new Error('debug error')), mockContext, 'fallback')

      expect(mockConsoleWarn).toHaveBeenCalled()
    })

    it('should handle non-Error exceptions', async () => {
      const result = await safeAsync(() => Promise.reject('string error'), mockContext, 'fallback')
      expect(result).toBe('fallback')
    })
  })

  describe('safeReadFile', () => {
    it('should read file successfully', async () => {
      // Mock fs/promises
      vi.doMock('node:fs/promises', () => ({
        readFile: vi.fn().mockResolvedValue('file content'),
      }))

      const result = await safeReadFile('/test/file.txt')
      expect(result).toBe('file content')
    })

    it('should return null when file read fails', async () => {
      // Mock fs/promises to throw error
      vi.doMock('node:fs/promises', () => ({
        readFile: vi.fn().mockRejectedValue(new Error('File not found')),
      }))

      const result = await safeReadFile('/nonexistent/file.txt')
      expect(result).toBeNull()
    })

    it('should use custom encoding', async () => {
      const mockReadFile = vi.fn().mockResolvedValue('file content')
      vi.doMock('node:fs/promises', () => ({
        readFile: mockReadFile,
      }))

      await safeReadFile('/test/file.txt', 'ascii')
      expect(mockReadFile).toHaveBeenCalledWith('/test/file.txt', 'ascii')
    })
  })

  describe('safeParseJSON', () => {
    it('should parse valid JSON', () => {
      const result = safeParseJSON('{"key": "value"}', mockContext)
      expect(result).toEqual({ key: 'value' })
    })

    it('should return null for invalid JSON', () => {
      const result = safeParseJSON('invalid json', mockContext)
      expect(result).toBeNull()
    })

    it('should handle empty string', () => {
      const result = safeParseJSON('', mockContext)
      expect(result).toBeNull()
    })
  })

  describe('safeBatch', () => {
    it('should execute all operations successfully', async () => {
      const operations = [
        {
          operation: () => Promise.resolve('result1'),
          context: { operation: 'op1' },
          fallback: 'fallback1',
        },
        {
          operation: () => Promise.resolve('result2'),
          context: { operation: 'op2' },
          fallback: 'fallback2',
        },
      ]

      const results = await safeBatch(operations)
      expect(results).toEqual(['result1', 'result2'])
    })

    it('should handle mixed success and failure operations', async () => {
      const operations = [
        {
          operation: () => Promise.resolve('success'),
          context: { operation: 'success_op' },
          fallback: 'fallback1',
        },
        {
          operation: () => Promise.reject(new Error('failure')),
          context: { operation: 'failure_op' },
          fallback: 'fallback2',
        },
      ]

      const results = await safeBatch(operations)
      expect(results).toEqual(['success', 'fallback2'])
    })

    it('should handle empty operations array', async () => {
      const results = await safeBatch([])
      expect(results).toEqual([])
    })
  })

  describe('StarterError', () => {
    it('should create error with correct properties', () => {
      const error = new StarterError('test message', 'TEST_ERROR', mockContext)
      expect(error.name).toBe('StarterError')
      expect(error.message).toBe('test message')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.context).toBe(mockContext)
    })
  })

  describe('classifyError', () => {
    it('should classify file errors', () => {
      const error = new Error('ENOENT: no such file or directory')
      const result = classifyError(error)

      expect(result.type).toBe('file')
      expect(result.message).toBe('文件或目录不存在')
      expect(result.suggestions).toContain('检查文件路径是否正确')
    })

    it('should classify permission errors', () => {
      const error = new Error('EACCES: permission denied')
      const result = classifyError(error)

      expect(result.type).toBe('permission')
      expect(result.message).toBe('权限不足')
      expect(result.suggestions).toContain('检查文件权限设置')
    })

    it('should classify network errors', () => {
      const error = new Error('network timeout')
      const result = classifyError(error)

      expect(result.type).toBe('network')
      expect(result.message).toBe('网络连接问题')
      expect(result.suggestions).toContain('检查网络连接')
    })

    it('should classify validation errors', () => {
      const error = new Error('invalid syntax')
      const result = classifyError(error)

      expect(result.type).toBe('validation')
      expect(result.message).toBe('数据格式错误')
      expect(result.suggestions).toContain('检查输入数据格式')
    })

    it('should classify unknown errors', () => {
      const error = new Error('some unknown error')
      const result = classifyError(error)

      expect(result.type).toBe('unknown')
      expect(result.message).toBe('some unknown error')
      expect(result.suggestions).toContain('查看详细日志信息')
    })
  })
})
