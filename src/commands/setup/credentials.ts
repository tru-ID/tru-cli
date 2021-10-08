import { Command } from '@oclif/command'
import * as fs from 'fs-extra'
import * as path from 'path'
import IGlobalConfiguration from '../../IGlobalConfiguration'

export default class SetupCredentials extends Command {
  static description = 'Setup the CLI with workspace credentials'

  static args = [
    {
      name: 'client-id',
      required: true,
      description: 'the workspace credentials id',
    },
    {
      name: 'client-secret',
      required: true,
      description: 'the workspace credentials secret',
    },
    {
      name: 'data-residency',
      required: true,
      description: 'the data residency of this workspace e.g. EU',
    },
  ]

  async run() {
    const { args } = this.parse(SetupCredentials)

    const configLocation = path.join(this.config.configDir, 'config.json')
    const cfg = await this.getOrCreateConfig(configLocation)

    cfg.defaultWorkspaceClientId = args['client-id']
    cfg.defaultWorkspaceClientSecret = args['client-secret']
    cfg.defaultWorkspaceDataResidency = (
      args['data-residency'] as string
    ).toLowerCase()

    await this.saveConfig(configLocation, cfg)

    this.log(`new credentials were written to ${configLocation}`)
  }

  async catch(err: Error) {
    this.error(`failed to setup credentials: ${err.message}`, { exit: 1 })
  }

  async getOrCreateConfig(
    configLocation: string,
  ): Promise<IGlobalConfiguration> {
    let config: IGlobalConfiguration = {}
    if (!fs.existsSync(configLocation)) {
      await this.saveConfig(configLocation, config)
    } else {
      try {
        config = await fs.readJson(configLocation)
      } catch (err) {
        throw new Error(`failed to read config file: ${err.message}`)
      }
    }
    return config
  }

  async saveConfig(
    configLocation: string,
    config: IGlobalConfiguration,
  ): Promise<void> {
    try {
      await fs.outputJson(configLocation, config, { spaces: 2 })
    } catch (err) {
      if (err.code === 'EPERM') {
        throw new Error(
          `failed to save config file, you might need elevated permissions: ${err.message}`,
        )
      } else {
        throw new Error(`failed to save config file: ${err.message}`)
      }
    }
  }
}
