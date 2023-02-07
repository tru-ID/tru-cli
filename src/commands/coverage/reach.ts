import { CliUx } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  CoverageAPIClient,
  ICoverageReachResponse,
  IProduct,
} from '../../api/CoverageAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR, tokenUrlDR } from '../../DefaultUrls'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import { ConsoleLogger, LogLevel } from '../../helpers/ConsoleLogger'
import {
  doesProjectConfigExist,
  isProjectCredentialsValid,
} from '../../helpers/ValidationUtils'
import Credential from '../../IProjectConfiguration'
import { logApiError } from '../../utilities'

export default class CoverageReach extends CommandWithProjectConfig {
  static description = 'Find if a certain device ip is reachable'

  static args = [
    {
      name: 'device-ip',
      required: true,
      description: 'the device ip in ipv4 or ipv6 format',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...CliUx.ux.table.flags(),
  }

  async run(): Promise<any> {
    const { args, flags } = await this.parse(CoverageReach)
    const deviceIp = args['device-ip']

    this.flags = flags
    await this.loadProjectConfig()

    doesProjectConfigExist(this.projectConfig)
    isProjectCredentialsValid(this.projectConfig!)

    if (!this.projectConfig?.data_residency) {
      this.warn(
        'No data_residency specified in project config tru.json. It will default to eu',
      )
    }

    const credentials = this.projectConfig!.credentials[0]!

    const apiClient = this.newApiClient(credentials, flags.debug)

    try {
      const response = await apiClient.reach(deviceIp)

      this.printResponse(response)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }

  async catch(err: Error): Promise<void> {
    this.error(`failed to retrieve reach: ${err.message}`, { exit: 1 })
  }

  newApiClient(credentials: Credential, debug: boolean): CoverageAPIClient {
    const requiredScope = credentials?.scopes?.find((s) => s === 'coverage')

    if (!requiredScope) {
      throw new Error(`this project does not have the required scope: coverage`)
    }

    const logger = new ConsoleLogger(debug ? LogLevel.debug : LogLevel.info)

    const config: APIClientCredentialsConfiguration = {
      clientId: credentials!.client_id,
      clientSecret: credentials!.client_secret,
      scopes: [requiredScope],
      tokenUrl: tokenUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
    }

    const tokenManager = new ClientCredentialsManager(config, logger)

    return new CoverageAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
      logger,
    )
  }

  printDefault(response: ICoverageReachResponse): void {
    if (response) {
      CliUx.ux.table(
        [response],
        {
          network_id: { header: 'network_id' },
          network_name: { header: 'network_name' },
          country_code: { header: 'country_code' },
          supported_products: {
            header: 'supported_products',
            get: (row: ICoverageReachResponse) =>
              row.products.map((p: IProduct) => p.product_name).join(','),
          },
        },
        { ...this.flags },
      )
    } else {
      this.log('No reach for this device')
    }
  }
}
