import { cli } from 'cli-ux'
import { APIConfiguration } from '../../api/APIConfiguration'
import {
  CoverageAPIClient,
  ICoverageReachResponse,
  IProduct,
} from '../../api/CoverageAPIClient'
import IAPICredentials from '../../api/IAPICredentails'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import { ConsoleLogger, LogLevel } from '../../helpers/ConsoleLogger'
import { logApiError } from '../../utilities'

export default class CoverageReach extends CommandWithProjectConfig {
  static description = 'Find if a certain device ip is reachable'

  static args = [
    {
      name: 'device-ip',
      required: true,
      description: 'The device ip in ipv4 or ipv6 format',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...cli.table.flags(),
  }

  async run(): Promise<any> {
    const { args, flags } = this.parse(CoverageReach)
    const deviceIp = args['device-ip']

    this.flags = flags
    await this.loadProjectConfig()

    const credentials = this.projectConfig?.credentials[0]
    if (!credentials) {
      throw new Error('missing project credentials')
    }

    const apiClient = this.newApiClient(credentials, flags.debug)

    let response: ICoverageReachResponse | undefined
    try {
      response = await apiClient.reach(deviceIp)
    } catch (error) {
      logApiError(this.log, error)
      this.exit(1)
    }

    if (response) {
      cli.table(
        [response],
        {
          network_id: { header: 'network_id' },
          network_name: { header: 'network_name' },
          country_code: { header: 'country_code' },
          supported_products: {
            header: 'supported_products',
            get: (row) =>
              row.products.map((p: IProduct) => p.product_name).join(','),
          },
        },
        { ...this.flags },
      )
    } else {
      this.log('No reach for this device')
    }
  }

  async catch(err: Error) {
    this.error(`failed to retrieve reach: ${err.message}`, { exit: 1 })
  }

  newApiClient(
    credentials: IAPICredentials,
    debug: boolean,
  ): CoverageAPIClient {
    const requiredScope = credentials?.scopes?.find((s) => s === 'coverage')

    if (!requiredScope) {
      throw new Error(`this project does not have the required scope: coverage`)
    }

    const config = new APIConfiguration({
      clientId: credentials?.client_id,
      clientSecret: credentials?.client_secret,
      scopes: [requiredScope],
      baseUrl:
        this.globalConfig?.apiBaseUrlOverride ??
        `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`,
    })

    const logger = new ConsoleLogger(!debug ? LogLevel.info : LogLevel.debug)

    return new CoverageAPIClient(config, logger)
  }
}
