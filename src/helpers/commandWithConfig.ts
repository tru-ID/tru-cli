import {Command} from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'

export default abstract class CommandWithConfig extends Command {
  userConfig: any
  async run() {
    this.userConfig = await fs.readJSON(path.join(this.config.configDir, 'config.json'))
  }
}