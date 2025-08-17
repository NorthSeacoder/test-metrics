/**
 * Configuration options for the starter
 */
export interface StarterOptions {
  /**
   * Input file or path to process
   */
  input?: string
  /**
   * Output directory
   * Default: `'.'`
   */
  output?: string
  /**
   * Enable verbose output
   */
  verbose?: boolean
  /**
   * Enable dry run mode
   */
  dryRun?: boolean
}

/**
 * Result of a starter operation
 */
export interface StarterResult {
  success: boolean
  message?: string
  data?: any
}
