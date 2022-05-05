import { CliUx } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  CoverageAPIClient,
  ICoverageCountryResponse,
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

export default class CoverageCountry extends CommandWithProjectConfig {
  static description = 'Retrieve country based coverage and prices'

  static args = [
    {
      name: 'code',
      required: true,
      description: 'two letter code ISO 3166-1 alpha-2 or country dialing code',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...CliUx.ux.table.flags(),
  }

  async run(): Promise<any> {
    const { args, flags } = await this.parse(CoverageCountry)
    const code = args.code

    this.flags = flags
    await this.loadProjectConfig()

    doesProjectConfigExist(this.projectConfig)
    isProjectCredentialsValid(this.projectConfig!)

    const credentials = this.projectConfig!.credentials[0]!

    const apiClient = this.newApiClient(credentials, flags.debug)

    let response: ICoverageCountryResponse | undefined
    try {
      response = await apiClient.countryReach(code)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }

    if (response) {
      const transformed = this.transformResult(response)
      CliUx.ux.table(
        transformed,
        {
          country_code: { header: 'country_code', extended: true },
          dialing_code: { header: 'dialing_code', extended: true },
          product_id: { header: 'product_id', extended: true },
          product_name: { header: 'product_name' },
          network_id: { header: 'network_id' },
          network_name: { header: 'network_name' },
          currency: { header: 'currency' },
          amount: { header: 'amount' },
        },
        { ...this.flags },
      )
    } else {
      this.log('No reach for this country/dialing code')
    }
  }

  async catch(err: Error) {
    this.error(`failed to retrieve country coverage: ${err.message}`, {
      exit: 1,
    })
  }

  transformResult(countryCoverage: ICoverageCountryResponse): any[] {
    const { country_code, dialing_code, products } = countryCoverage
    const result: any[] = []

    for (const p of products) {
      if (p.networks) {
        for (const network of p.networks) {
          if (network.prices) {
            for (const price of network.prices) {
              const transformed = {
                country_code,
                dialing_code,
                product_id: p.product_id,
                product_name: p.product_name,
                network_id: network.network_id,
                network_name: network.network_name,
                currency: price.currency,
                amount: price.amount,
              }
              result.push(transformed)
            }
          }
        }
      }
    }

    return result
  }

  newApiClient(credentials: Credential, debug: boolean): CoverageAPIClient {
    const requiredScope = credentials?.scopes?.find((s) => s === 'coverage')

    if (!requiredScope) {
      throw new Error(`this project does not have the required scope: coverage`)
    }

    if (!this.projectConfig?.data_residency) {
      this.warn(
        'No data_residency specified in project config tru.json. It will default to eu',
      )
    }

    const logger = new ConsoleLogger(debug ? LogLevel.debug : LogLevel.info)

    const config: APIClientCredentialsConfiguration = {
      clientId: credentials?.client_id,
      clientSecret: credentials?.client_secret,
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
}
