import { describe, it, expect, vi } from 'vitest'
import { starter, starterAsync } from './starter'
import type { StarterOptions } from './types/starter'

describe('starter', () => {
  // Mock console.log to avoid output during tests
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  afterEach(() => {
    consoleSpy.mockClear()
  })

  describe('starter function', () => {
    it('should return success result with default options', () => {
      const result = starter()

      expect(result).toEqual({
        success: true,
        message: 'Starter completed successfully',
      })
      expect(consoleSpy).toHaveBeenCalledWith('Starter initialized with options:', {})
    })

    it('should return success result with custom options', () => {
      const options: StarterOptions = {
        name: 'test-project',
        version: '1.0.0',
      }

      const result = starter(options)

      expect(result).toEqual({
        success: true,
        message: 'Starter completed successfully',
      })
      expect(consoleSpy).toHaveBeenCalledWith('Starter initialized with options:', options)
    })

    it('should handle errors gracefully', () => {
      // Mock console.log to throw an error
      consoleSpy.mockImplementationOnce(() => {
        throw new Error('Test error')
      })

      const result = starter()

      expect(result).toEqual({
        success: false,
        message: 'Test error',
      })
    })

    it('should handle non-Error exceptions', () => {
      // Mock console.log to throw a non-Error
      consoleSpy.mockImplementationOnce(() => {
        throw 'String error'
      })

      const result = starter()

      expect(result).toEqual({
        success: false,
        message: 'Unknown error occurred',
      })
    })
  })

  describe('starterAsync function', () => {
    it('should return success result with default options', async () => {
      const result = await starterAsync()

      expect(result).toEqual({
        success: true,
        message: 'Starter completed successfully',
      })
      expect(consoleSpy).toHaveBeenCalledWith('Starter initialized with options:', {})
    })

    it('should return success result with custom options', async () => {
      const options: StarterOptions = {
        name: 'async-test-project',
        version: '2.0.0',
      }

      const result = await starterAsync(options)

      expect(result).toEqual({
        success: true,
        message: 'Starter completed successfully',
      })
      expect(consoleSpy).toHaveBeenCalledWith('Starter initialized with options:', options)
    })

    it('should handle errors gracefully in async version', async () => {
      // Mock console.log to throw an error
      consoleSpy.mockImplementationOnce(() => {
        throw new Error('Async test error')
      })

      const result = await starterAsync()

      expect(result).toEqual({
        success: false,
        message: 'Async test error',
      })
    })
  })
})
