import { Command, Config, Flags } from '@oclif/core'
import fs from 'fs-extra'
import path from 'path'
import { ConsoleLogger, LogLevel } from '../helpers/ConsoleLogger'
import { IGlobalAuthConfiguration } from '../IGlobalAuthConfiguration'
import ILogger from './ILogger'
import { printJson } from '../utilities'

export default abstract class CommandWithGlobalConfig extends Command {
  static flags = {
    debug: Flags.boolean({
      description: 'enables debug logging for the CLI',
    }),
    help: Flags.help({
      description: 'show CLI help',
    }),
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

  async init(): Promise<void> {
    await super.init()
    const configLocation = this.getConfigPath()

    await this.loadGlobalConfig(configLocation)
  }

  async run(): Promise<void> {
    this.logger = new ConsoleLogger(
      !this.flags.debug ? LogLevel.info : LogLevel.debug,
    )
    this.logger.debug('--debug', true)
  }

  getConfigPath(): string {
    return path.join(this.config.configDir, 'config.json')
  }

  async loadGlobalConfig(configLocation: string): Promise<void> {
    if (!fs.existsSync(configLocation)) {
      this.error(
        `cannot find config file at ${configLocation}\nRun "tru login" to configure the CLI`,
      )
    }

    this.globalConfig = await fs.readJson(configLocation)
  }

  printResponse(response: any): void {
    if (this.flags.output === 'json') {
      printJson(this.logger, response)
      return
    }
    this.printDefault(response)
  }

  abstract printDefault(response: any): void
}
