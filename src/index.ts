// Core functionality
export { starter, starterAsync } from './starter'

// Types
export type { StarterOptions, StarterResult } from './types/starter'

// CLI (for programmatic usage)
export { main as runCli } from './cli'
export { ExitCode } from './cli/exit-code'

// Utilities (only if they provide real value to end users)
export { hello } from './utils'
