import { Command, Config, Flags } from '@oclif/core'
import fs from 'fs-extra'
import path from 'path'
import { ConsoleLogger, LogLevel } from '../helpers/ConsoleLogger'
import IGlobalConfiguration from '../IGlobalConfiguration'
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

  globalConfig?: IGlobalConfiguration

  protected logger: ILogger

  constructor(argv: string[], config: Config) {
    super(argv, config)
    this.logger = new ConsoleLogger(
      !this.flags.debug ? LogLevel.info : LogLevel.debug,
    )
  }

  async init() {
    super.init()

    const configLocation = path.join(this.config.configDir, 'config.json')
    if (!fs.existsSync(configLocation)) {
      this.error(
        `cannot find config file at ${configLocation}\nRun "tru setup:credentials" to configure the CLI`,
      )
    }

    this.globalConfig = await fs.readJson(
      path.join(this.config.configDir, 'config.json'),
    )
  }

  async run() {
    this.logger = new ConsoleLogger(
      !this.flags.debug ? LogLevel.info : LogLevel.debug,
    )
    this.logger.debug('--debug', true)
  }
}
