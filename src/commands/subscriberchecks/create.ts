import { Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  SubscriberCheckAPIClient,
  SubscriberCheckResource,
} from '../../api/SubscriberCheckAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'
import ILogger from '../../helpers/ILogger'

export default class SubscriberChecksCreate extends ChecksCreateCommand {
  static typeOfCheck = 'SubscriberCheck'

  static description = `Creates SubscriberChecks within a project`

  static flags = {
    ...ChecksCreateCommand.flags,
  }

  static args = [...ChecksCreateCommand.args]

  constructor(argv: string[], config: Config) {
    super('SubscriberCheck', 'subscriber_check', argv, config)
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

  getPolling(): number {
    return (
      this.globalConfig?.subscriberCheckWorkflowRetryMillisecondsOverride ??
      5000
    )
  }

  logResult(checkResponse: SubscriberCheckResource): void {
    this.log('')
    this.log(
      `${this.typeOfCheck} Workflow result:\n` +
        `\tstatus:  ${checkResponse.status}\n` +
        `\tmatch:  ${checkResponse.match} ${
          checkResponse.match ? '✅' : '❌'
        }\n` +
        `\tno_sim_change:  ${checkResponse.no_sim_change} ${
          checkResponse.no_sim_change ? '✅' : '❌'
        }\n`,
    )
  }
}
