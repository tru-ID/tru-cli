import { flags } from '@oclif/command'
import * as Config from '@oclif/config'
import { APIConfiguration } from '../../api/APIConfiguration'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import { IdentityCheckAPIClient, IdentityCheckResource } from '../../api/IdentityCheckAPIClient'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'
import { CheckResource } from '../../api/ChecksAPIClient'

export default class IdentityChecksCreate extends ChecksCreateCommand {

  static description = 'Manages Identity Checks within a Project'

  static typeOfCheck = "Identity Check"

  static flags = {
    ...ChecksCreateCommand.flags
  }

  static args = [
    ...ChecksCreateCommand.args
  ]

  constructor(argv: string[], config: Config.IConfig) {
    super("Identity Check", "identity_check", argv, config)
  }

  parseCommand() {
    return this.parse(IdentityChecksCreate);
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new IdentityCheckAPIClient(apiConfiguration, logger)
  }

  getPolling() {
    return this.globalConfig?.identityCheckWorkflowRetryMillisecondsOverride ?? 5000
  }

  logResult(checkResponse: IdentityCheckResource) {
    this.log('')
    this.log(`${this.typeOfCheck} Workflow result:\n` +
      `\tstatus:\t${checkResponse.status}\n` +
      `\tmatch:\t${checkResponse.match} ${checkResponse.match ? '✅' : '❌'}\n`+
      `\tno_sim_change:\t${checkResponse.no_sim_change} ${checkResponse.no_sim_change ? '✅' : '❌'}\n`)
  }

}
