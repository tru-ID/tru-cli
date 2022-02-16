import { Config } from '@oclif/core'
import { APIConfiguration } from '../../api/APIConfiguration'
import { CheckResource } from '../../api/ChecksAPIClient'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
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

  getPolling() {
    return (
      this.globalConfig?.phoneCheckWorkflowRetryMillisecondsOverride ?? 5000
    )
  }

  async parseCommand() {
    const command = await this.parse(PhoneChecksCreate)
    return command
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new PhoneChecksAPIClient(apiConfiguration, logger)
  }

  logResult(checkResponse: CheckResource) {
    this.log('')
    this.log(
      `${this.typeOfCheck} Workflow result:\n` +
        `\tstatus:  ${checkResponse.status}\n` +
        `\tmatch:  ${checkResponse.match} ${checkResponse.match ? '✅' : '❌'}`,
    )
  }
}
