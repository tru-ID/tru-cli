import { Command, Config, Flags, Help } from '@oclif/core'
import fs from 'fs-extra'
import path from 'path'
import { ConsoleLogger, LogLevel } from '../helpers/ConsoleLogger'
import { IGlobalAuthConfiguration } from '../IGlobalAuthConfiguration'
import ILogger from './ILogger'

export default abstract class CommandWithGlobalConfig extends Command {
  static flags = {
    debug: Flags.boolean({
      description: 'Enables debug logging for the CLI',
    }),
    help: Flags.help({ char: 'h' }),
  }

  flags: {
    [name: string]: any
  } = {}
  args: {
    [name: string]: any
  } = {}

  globalConfig?: IGlobalAuthConfiguration

  protected logger: ILogger

  constructor(argv: string[], config: Config) {
    super(argv, config)
    this.logger = new ConsoleLogger(
      !this.flags.debug ? LogLevel.info : LogLevel.debug,
    )
  }

  async init() {
    super.init()
    const configLocation = this.getConfigPath()

    await this.loadGlobalConfig(configLocation)
  }

  async run() {
    this.logger = new ConsoleLogger(
      !this.flags.debug ? LogLevel.info : LogLevel.debug,
    )
    this.logger.debug('--debug', true)
  }

  showCommandHelp({ exitCode = 0 }: { exitCode: number }): void {
    const help = new Help(this.config)
    const cmd = this.config.findCommand(this.id as string)
    if (cmd) {
      help.showCommandHelp(cmd)
    }
    return this.exit(exitCode)
  }

  getConfigPath(): string {
    return path.join(this.config.configDir, 'config.json')
  }

  async loadGlobalConfig(configLocation: string): Promise<void> {
    if (!fs.existsSync(configLocation)) {
      this.error(
        `cannot find config file at ${configLocation}\nRun "tru setup:oauth2" to configure the CLI`,
      )
    }

    this.globalConfig = await fs.readJson(configLocation)
  }
}
