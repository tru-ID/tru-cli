import { Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import { CheckResource } from '../../api/ChecksAPIClient'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'
import ILogger from '../../helpers/ILogger'

export default class PhoneChecksCreate extends ChecksCreateCommand {
  static description = 'Creates a PhoneCheck within a project'

  static typeOfCheck = 'PhoneCheck'

  static flags = {
    ...ChecksCreateCommand.flags,
  }

  static args = [...ChecksCreateCommand.args]

  constructor(argv: string[], config: Config) {
    super('PhoneCheck', 'phone_check', argv, config)
  }

  getPolling(): number {
    return (
      this.globalConfig?.phoneCheckWorkflowRetryMillisecondsOverride ?? 5000
    )
  }

  async parseCommand() {
    const command = await this.parse(PhoneChecksCreate)
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

  logResult(checkResponse: CheckResource): void {
    this.log('')
    this.log(
      `${this.typeOfCheck} Workflow result:\n` +
        `\tstatus:  ${checkResponse.status}\n` +
        `\tmatch:  ${checkResponse.match} ${checkResponse.match ? '✅' : '❌'}`,
    )
  }
}
