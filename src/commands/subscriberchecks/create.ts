import { Config } from '@oclif/core'
import { APIConfiguration } from '../../api/APIConfiguration'
import {
  SubscriberCheckAPIClient,
  SubscriberCheckResource,
} from '../../api/SubscriberCheckAPIClient'
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
