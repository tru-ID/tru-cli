import { flags } from '@oclif/command'
import * as Config from '@oclif/config'
import { APIConfiguration } from '../../api/APIConfiguration'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import {
  SubscriberCheckAPIClient,
  SubscriberCheckResource,
} from '../../api/SubscriberCheckAPIClient'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'
import { CheckResource } from '../../api/ChecksAPIClient'

export default class SubscriberChecksCreate extends ChecksCreateCommand {
  static typeOfCheck = 'SubscriberCheck'

  static description = `Creates SubscriberChecks within a project`

  static flags = {
    ...ChecksCreateCommand.flags,
  }

  static args = [...ChecksCreateCommand.args]

  constructor(argv: string[], config: Config.IConfig) {
    super('SubscriberCheck', 'subscriber_check', argv, config)
  }

  parseCommand() {
    return this.parse(SubscriberChecksCreate)
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new SubscriberCheckAPIClient(apiConfiguration, logger)
  }

  getPolling() {
    return (
      this.globalConfig?.subscriberCheckWorkflowRetryMillisecondsOverride ??
      5000
    )
  }

  logResult(checkResponse: SubscriberCheckResource) {
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
