import { CliUx, Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  SimCheckAPIClient,
  SimCheckResponse,
} from '../../api/SimCheckAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ILogger from '../../helpers/ILogger'
import ChecksListCommand from '../../helpers/ChecksListCommand'

export default class SimCheckList extends ChecksListCommand {
  static description =
    'Lists details for all SIMChecks or a specific SIMCheck if the a check-id argument is passed'

  static flags = {
    ...ChecksListCommand.flags,
  }

  static args = [...ChecksListCommand.args]

  static typeOfCheck = 'SIMCheck'

  constructor(argv: string[], config: Config) {
    super(SimCheckList.typeOfCheck, 'sim_check', argv, config)
  }

  async parseCommand(): Promise<any> {
    return this.parse(SimCheckList)
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,
    logger: ILogger,
  ): SimCheckAPIClient {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new SimCheckAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
      logger,
    )
  }

  printDefault(resources: SimCheckResponse[]): void {
    // do not use table sort as it only works for simple types e.g., number, etc.
    // and the API already returns sorted results
    const flagsWithNoSort = { ...this.flags, sort: undefined }

    CliUx.ux.table(
      resources,
      {
        check_id: {
          header: 'check_id',
        },
        created_at: {
          header: 'created_at',
        },
        status: {
          header: 'status',
        },
        charge_currency: {
          header: 'charge_currency',
        },
        charge_amount: {
          header: 'charge_amount',
        },
        no_sim_change: {
          header: 'no_sim_change',
        },
        url: {
          extended: true,
          header: '_links.self.href',
          get: (row) => row._links.self.href,
        },
      },
      {
        printLine: (s: any) => {
          this.logger!.info(s)
        },
        ...flagsWithNoSort, // parsed flags
      },
    )
  }
}
