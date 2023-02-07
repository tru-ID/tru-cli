import { CliUx, Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  CreateSubscriberCheckResponse,
  SubscriberCheckAPIClient,
} from '../../api/SubscriberCheckAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'
import ILogger from '../../helpers/ILogger'
import { CheckStatus } from '../../api/CheckStatus'

export default class SubscriberChecksCreate extends ChecksCreateCommand {
  static typeOfCheck = 'SubscriberCheck'

  static description = `Creates SubscriberChecks within a project`

  static flags = {
    ...ChecksCreateCommand.flags,
  }

  static args = [...ChecksCreateCommand.args]

  constructor(argv: string[], config: Config) {
    super(SubscriberChecksCreate.typeOfCheck, 'subscriber_check', argv, config)
  }

  parseCommand() {
    return this.parse(SubscriberChecksCreate)
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

  printDefault(response: CreateSubscriberCheckResponse): void {
    if (response.status !== CheckStatus.ACCEPTED) {
      this.log(
        `The ${this.typeOfCheck} could not be created. The ${this.typeOfCheck} status is ${response.status}`,
      )
      return
    }

    if (!this.flags.output) {
      this.log(`${this.typeOfCheck} ACCEPTED`)
      this.log(`check_id: ${response.check_id}`)
      this.log(`check_url: ${response.url}`)
      return
    }

    CliUx.ux.table(
      [response],
      {
        status: { header: 'status' },
        check_id: { header: 'check_id' },
        url: { header: 'check_url' },
      },
      { ...this.flags },
    )
  }
}
