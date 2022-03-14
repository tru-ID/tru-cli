import { Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import { SubscriberCheckAPIClient } from '../../api/SubscriberCheckAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksTraceCommand from '../../helpers/ChecksTraceCommand'
import ILogger from '../../helpers/ILogger'

export default class SubscriberCheckTraces extends ChecksTraceCommand {
  static description = 'Get the traces of a SubscriberCheck'

  static typeOfCheck = 'SubscriberCheck'

  static flags = {
    ...ChecksTraceCommand.flags,
  }

  static args = [...ChecksTraceCommand.args]

  constructor(argv: string[], config: Config) {
    super('SubscriberCheck', 'subscriber_check', argv, config)
  }

  parseCommand() {
    return this.parse(SubscriberCheckTraces)
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,

    logger: ILogger,
  ): SubscriberCheckAPIClient {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new SubscriberCheckAPIClient(
      tokenManager,
      apiBaseUrlDR(this.globalConfig!),
      logger,
    )
  }
}
