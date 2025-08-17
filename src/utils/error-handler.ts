/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 操作名称 */
  operation: string
  /** 文件路径（可选） */
  filePath?: string
  /** 详细信息（可选） */
  details?: Record<string, any>
}

/**
 * 安全异步操作包装器
 * @param operation 要执行的异步操作
 * @param context 错误上下文
 * @param fallback 失败时的回退值
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback: T
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.warn(
        `[${context.operation}] 操作失败:`,
        errorMessage,
        context.filePath && `文件: ${context.filePath}`
      )
    }

    return fallback
  }
}

/**
 * 安全同步操作包装器
 * @param operation 要执行的同步操作
 * @param context 错误上下文
 * @param fallback 失败时的回退值
 */
export function safeSync<T>(operation: () => T, context: ErrorContext, fallback: T): T {
  try {
    return operation()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.warn(
        `[${context.operation}] 操作失败:`,
        errorMessage,
        context.filePath && `文件: ${context.filePath}`
      )
    }

    return fallback
  }
}

/**
 * 安全文件读取
 * @param filePath 文件路径
 * @param encoding 编码格式
 */
export async function safeReadFile(
  filePath: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<string | null> {
  const { readFile } = await import('node:fs/promises')

  return safeAsync(() => readFile(filePath, encoding), { operation: '文件读取', filePath }, null)
}

/**
 * 安全 JSON 解析
 * @param content JSON 字符串内容
 * @param context 错误上下文
 */
export function safeParseJSON<T = any>(content: string, context: ErrorContext): T | null {
  return safeSync(
    () => JSON.parse(content),
    { ...context, operation: `${context.operation} - JSON解析` },
    null
  )
}

/**
 * 批量安全操作
 * @param operations 操作列表
 */
export async function safeBatch<T>(
  operations: Array<{
    operation: () => Promise<T>
    context: ErrorContext
    fallback: T
  }>
): Promise<T[]> {
  const results: T[] = []

  for (const { operation, context, fallback } of operations) {
    const result = await safeAsync(operation, context, fallback)
    results.push(result)
  }

  return results
}

/**
 * 创建自定义错误类
 */
export class StarterError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: ErrorContext
  ) {
    super(message)
    this.name = 'StarterError'
  }
}

/**
 * 错误分类和处理
 */
export function classifyError(error: Error): {
  type: 'file' | 'network' | 'permission' | 'validation' | 'unknown'
  message: string
  suggestions: string[]
} {
  const message = error.message.toLowerCase()

  if (message.includes('enoent') || message.includes('not found')) {
    return {
      type: 'file',
      message: '文件或目录不存在',
      suggestions: ['检查文件路径是否正确', '确认文件是否存在', '使用绝对路径重试'],
    }
  }

  if (message.includes('eacces') || message.includes('permission')) {
    return {
      type: 'permission',
      message: '权限不足',
      suggestions: ['检查文件权限设置', '使用管理员权限运行', '确认对目录有写入权限'],
    }
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return {
      type: 'network',
      message: '网络连接问题',
      suggestions: ['检查网络连接', '稍后重试', '确认代理设置'],
    }
  }

  if (message.includes('invalid') || message.includes('parse') || message.includes('syntax')) {
    return {
      type: 'validation',
      message: '数据格式错误',
      suggestions: ['检查输入数据格式', '验证文件内容', '参考文档示例'],
    }
  }

  return {
    type: 'unknown',
    message: error.message || '未知错误',
    suggestions: ['查看详细日志信息', '使用 --verbose 获取更多信息', '检查项目文档'],
  }
}
