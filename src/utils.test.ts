import { describe, it, expect } from 'vitest'
import { hello } from './utils'

describe('utils', () => {
  describe('hello', () => {
    it('should return greeting with name', () => {
      expect(hello('World')).toBe('Hello, World!')
    })

    it('should handle empty string', () => {
      expect(hello('')).toBe('Hello, !')
    })

    it('should handle special characters', () => {
      expect(hello('张三')).toBe('Hello, 张三!')
    })
  })
})
