import { CliUx, Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import { CheckResource } from '../../api/ChecksAPIClient'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksListCommand from '../../helpers/ChecksListCommand'
import ILogger from '../../helpers/ILogger'

export default class PhoneChecksList extends ChecksListCommand {
  static description =
    'Lists details for all PhoneChecks or a specific PhoneCheck if the a check-id argument is passed'

  static flags = {
    ...ChecksListCommand.flags,
  }

  static args = [
    {
      name: 'check_id',
      required: false,
      description: 'The check_id for the PhoneCheck to list',
    },
  ]

  constructor(argv: string[], config: Config) {
    super('PhoneCheck', 'phone_check', argv, config)
  }

  async parseCommand(): Promise<any> {
    const command = await this.parse(PhoneChecksList)
    return command
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,

    logger: ILogger,
  ): PhoneChecksAPIClient {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new PhoneChecksAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
      logger,
    )
  }

  displayResults(resources: CheckResource[]): void {
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
