import { flags } from '@oclif/command'
import * as Config from '@oclif/config'
import { APIConfiguration } from '../../api/APIConfiguration'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'
import { CheckResource } from '../../api/ChecksAPIClient'

export default class PhoneChecksCreate extends ChecksCreateCommand {

  static description = 'Creates a Phone Check'

  static typeOfCheck = "Phone Check"

  static flags = {
    ...ChecksCreateCommand.flags
  }

  static args = [
    ...ChecksCreateCommand.args
  ]

  constructor(argv: string[], config: Config.IConfig) {
    super("Phone Check", "phone_check", argv, config)
  }

  getPolling() {
    return this.globalConfig?.phoneCheckWorkflowRetryMillisecondsOverride ?? 5000
  }

  parseCommand() {
    return this.parse(PhoneChecksCreate);
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new PhoneChecksAPIClient(apiConfiguration, logger)
  }

  logResult(checkResponse: CheckResource) {
    this.log('')
    this.log(`${this.typeOfCheck} Workflow result:\n` +
      `\tstatus:  ${checkResponse.status}\n` +
      `\tmatch:  ${checkResponse.match} ${checkResponse.match ? '✅' : '❌'}`)
  }

}
