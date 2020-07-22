import {Command} from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'

import IGlobalConfiguration from '../IGlobalConfiguration'

export default abstract class CommandWithGlobalConfig extends Command {
  globalConfig?: IGlobalConfiguration
  
  async init() {
    super.init()

    this.globalConfig = await fs.readJson(path.join(this.config.configDir, 'config.json'))
  }
}