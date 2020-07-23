import Command, {flags} from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'

import IGlobalConfiguration from '../IGlobalConfiguration'

export default abstract class CommandWithGlobalConfig extends Command {
  static flags = {
    debug: flags.boolean({
      description: 'Enables debug logging for the CLI',
    }),
    help: flags.help({char: 'h'}),
  }
  
  globalConfig?: IGlobalConfiguration
  
  async init() {
    super.init()

    this.globalConfig = await fs.readJson(path.join(this.config.configDir, 'config.json'))
  }
}