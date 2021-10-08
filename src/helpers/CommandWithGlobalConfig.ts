import Command, { flags } from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'

import IGlobalConfiguration from '../IGlobalConfiguration'
import ILogger from './ILogger'
import { ConsoleLogger, LogLevel } from '../helpers/ConsoleLogger'
import * as Config from '@oclif/config'

export default abstract class CommandWithGlobalConfig extends Command {
  static flags = {
    debug: flags.boolean({
      description: 'Enables debug logging for the CLI',
    }),
    help: flags.help({ char: 'h' }),
  }

  flags: {
    [name: string]: any
  } = {}
  args: {
    [name: string]: any
  } = {}

  globalConfig?: IGlobalConfiguration

  protected logger: ILogger

  constructor(argv: string[], config: Config.IConfig) {
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
