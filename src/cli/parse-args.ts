import process from 'node:process'
import { Command } from 'commander'
import chalk from 'chalk'
import type { StarterOptions } from '../types/starter'
import { version } from '../../package.json'
import { ExitCode } from './exit-code'

/**
 * 解析后的命令行参数
 */
export interface ParsedArgs {
  command: 'help' | 'version' | 'run'
  options: StarterOptions | null
}

/**
 * 解析命令行参数
 */
export async function parseArgs(argv = process.argv): Promise<ParsedArgs> {
  return new Promise((resolve) => {
    try {
      const program = new Command()

      program
        .name('starter')
        .description(
          '🚀 现代化 TypeScript 库开发工具\n\n' +
            '  Starter 是一个通用的库开发工具模板，提供完整的开发环境配置\n' +
            '  和最佳实践。支持 TypeScript、测试、构建等功能。\n\n' +
            '  适用场景: npm 库开发, CLI 工具开发, 通用工具库'
        )
        .version(version, '-v, --version', '显示版本号')
        .helpOption('-h, --help', '显示帮助信息')

      // 主命令
      program
        .argument('[input]', '输入文件或路径（可选）')
        .option('-o, --output <path>', '输出目录', '.')
        .option('--verbose', '显示详细输出')
        .option('--dry-run', '预览模式，显示将要执行的操作但不实际执行')
        .action((input: string | undefined, options: any) => {
          const starterOptions: StarterOptions = {
            input,
            output: options.output,
            verbose: options.verbose,
            dryRun: options.dryRun,
          }

          resolve({
            command: 'run',
            options: starterOptions,
          })
        })

      // 自定义帮助命令
      program
        .command('help')
        .description('显示帮助信息')
        .action(() => {
          showGeneralHelp()
          process.exit(ExitCode.Success)
        })

      // 如果没有参数，显示帮助信息
      if (argv.length <= 2) {
        showGeneralHelp()
        process.exit(ExitCode.Success)
      }

      program.parse(argv)

      // 如果没有匹配的命令，显示帮助
      resolve({
        command: 'help',
        options: null,
      })
    } catch (error) {
      console.error(chalk.red('参数解析错误:'), (error as Error).message)
      process.exit(ExitCode.InvalidArgument)
    }
  })
}

/**
 * 显示通用帮助信息
 */
function showGeneralHelp(): void {
  console.log(chalk.bold.cyan('\n🚀 Starter - TypeScript Library Development Tool'))
  console.log(chalk.gray(`版本: ${version}\n`))

  console.log(chalk.bold('用法:'))
  console.log('  starter [input] [options]')
  console.log('  starter help\n')

  console.log(chalk.bold('参数:'))
  console.log('  input              输入文件或路径（可选）\n')

  console.log(chalk.bold('选项:'))
  console.log('  -o, --output <path>    输出目录 (默认: ".")')
  console.log('  --verbose              显示详细输出')
  console.log('  --dry-run              预览模式')
  console.log('  -v, --version          显示版本号')
  console.log('  -h, --help             显示帮助信息\n')

  console.log(chalk.bold('示例:'))
  console.log(chalk.gray('  starter                           # 使用默认选项'))
  console.log(chalk.gray('  starter ./src --output ./dist     # 指定输入和输出'))
  console.log(chalk.gray('  starter --verbose                 # 显示详细信息'))
  console.log(chalk.gray('  starter --dry-run                 # 预览模式\n'))

  console.log(chalk.bold('获取更多帮助:'))
  console.log(chalk.gray('  • 查看项目文档: README.md'))
  console.log(chalk.gray('  • 提交问题: GitHub Issues'))
  console.log(chalk.gray('  • 参与讨论: GitHub Discussions'))
}
