import { Flags } from '@oclif/core'
import fs from 'fs-extra'
import path from 'path'
import { IProjectConfiguration } from '../IProjectConfiguration'
import CommandWithGlobalConfig from './CommandWithGlobalConfig'

export default abstract class CommandWithProjectConfig extends CommandWithGlobalConfig {
  static projectDirFlagName = 'project-dir'

  static projectDirFlag = Flags.string({
    description:
      'The directory that contains the tru.json Project configuration file',
  })

  static flags = {
    ...CommandWithGlobalConfig.flags,
    'project-dir': CommandWithProjectConfig.projectDirFlag,
  }

  projectConfig?: IProjectConfiguration

  async init(): Promise<void> {
    await super.init()
  }

  async loadProjectConfig(): Promise<void> {
    const projectDirectory =
      this.flags[CommandWithProjectConfig.projectDirFlagName] ?? process.cwd()
    const projectConfigFullPath = path.join(projectDirectory, 'tru.json')
    const projectConfigExists = fs.existsSync(projectConfigFullPath)
    if (projectConfigExists === false) {
      this.log(
        `A project configuration file does not exist at "${projectConfigFullPath}".\n` +
          'Please provide a valid directory path or run `tru projects:create` to create a project and associated configuration file.',
      )
      this.exit(1)
    }
    try {
      this.projectConfig = await fs.readJson(projectConfigFullPath)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.log(
          'There was a problem loading the tru.json configuration file',
          `${error.toString()} ${JSON.stringify(error)}`,
        )
      }
      this.exit(1)
    }
  }
}
