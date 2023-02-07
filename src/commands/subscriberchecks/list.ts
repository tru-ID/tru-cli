import { CliUx, Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  SubscriberCheckAPIClient,
  SubscriberCheckResponse,
} from '../../api/SubscriberCheckAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksListCommand from '../../helpers/ChecksListCommand'
import ILogger from '../../helpers/ILogger'

export default class SubscriberCheckList extends ChecksListCommand {
  static description =
    'Lists details for all SubscriberChecks or a specific SubscriberCheck if the a check-id argument is passed'

  static args = [...ChecksListCommand.args]

  static flags = {
    ...ChecksListCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super('SubscriberCheck', 'subscriber_check', argv, config)
  }

  parseCommand(): Promise<any> {
    return this.parse(SubscriberCheckList)
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,
    logger: ILogger,
  ): SubscriberCheckAPIClient {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new SubscriberCheckAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
      logger,
    )
  }

  printDefault(resources: SubscriberCheckResponse[]): void {
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
        match: {
          header: 'match',
        },
        charge_currency: {
          header: 'charge_currency',
        },
        charge_amount: {
          header: 'charge_amount',
        },
        updated_at: {
          header: 'updated_at',
          extended: true,
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
        ...flagsWithNoSort,
      },
    )
  }
}
