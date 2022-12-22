import { CliUx, Command } from '@oclif/core'
import fs from 'fs-extra'
import getPort from 'get-port'
import path from 'path'
import { TokenExchanger } from '../../helpers/oauth'
import {
  IGlobalAuthConfiguration,
  TokenInfo,
} from '../../IGlobalAuthConfiguration'

export default class Login extends Command {
  static description = 'Login to tru.ID'

  static args = [
    {
      name: 'IDP',
      required: true,
      description: 'The Identity Provider',
      options: ['google', 'github', 'microsoft'],
    },
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(Login)

    const configLocation = path.join(this.config.configDir, 'config.json')
    const configOAuth = await this.getOrCreateConfig(configLocation)

    const port = await getPort()
    const provider = args['IDP']
    const tokenExchanger = new TokenExchanger(port, provider, configOAuth)

    const { authorizationUrl } = tokenExchanger.start()

    this.log(`Visit this url to login: ${authorizationUrl}`)
    await CliUx.ux.open(authorizationUrl)

    const tokenInfo = await tokenExchanger.getTokens()

    await this.updateConfig(configLocation, configOAuth, tokenInfo)

    this.log(`Configuration written to: ${path.resolve(configLocation)}`)
    this.log(`Next steps:
  - 'tru workspaces:list' to list the workspace available to work on
  - 'tru workspaces:switch' to work on a given workspace
      `)
  }

  async catch(err: Error): Promise<any> {
    this.error(`failed to login: ${err.message}`, { exit: 1 })
  }

  async getOrCreateConfig(
    configLocation: string,
  ): Promise<IGlobalAuthConfiguration> {
    let config: IGlobalAuthConfiguration = {}
    if (!fs.existsSync(configLocation)) {
      await this.saveConfig(configLocation, config)
    } else {
      try {
        config = await fs.readJson(configLocation)
      } catch (err) {
        throw new Error(`failed to read config file: ${err}`)
      }
    }
    return config
  }

  async saveConfig(
    configLocation: string,
    config: IGlobalAuthConfiguration,
  ): Promise<void> {
    await fs.outputJson(configLocation, config, { spaces: 2 })
  }

  async updateConfig(
    configLocation: string,
    config: IGlobalAuthConfiguration,
    tokenInfo: TokenInfo,
  ): Promise<void> {
    const newConfig: IGlobalAuthConfiguration = {
      apiBaseUrlPattern: config.apiBaseUrlPattern,
      apiLoginUrlOverride: config.apiLoginUrlOverride,
      selectedWorkspaceDataResidency: config.selectedWorkspaceDataResidency,
      selectedWorkspace: config.selectedWorkspace,
      tokenInfo,
    }

    await this.saveConfig(configLocation, newConfig)
  }
}
