import { Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksTraceCommand from '../../helpers/ChecksTraceCommand'
import ILogger from '../../helpers/ILogger'

export default class PhoneCheckTraces extends ChecksTraceCommand {
  static description = 'Get the traces of a PhoneCheck'

  static typeOfCheck = 'PhoneCheck'

  static flags = {
    ...ChecksTraceCommand.flags,
  }

  static args = [...ChecksTraceCommand.args]

  constructor(argv: string[], config: Config) {
    super('PhoneCheck', 'phone_check', argv, config)
  }

  parseCommand() {
    return this.parse(PhoneCheckTraces)
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,

    logger: ILogger,
  ) {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new PhoneChecksAPIClient(
      tokenManager,
      apiBaseUrlDR(this.globalConfig!),
      logger,
    )
  }
}
