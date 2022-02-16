import { Config } from '@oclif/core'
import { APIConfiguration } from '../../api/APIConfiguration'
import { SubscriberCheckAPIClient } from '../../api/SubscriberCheckAPIClient'
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

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new SubscriberCheckAPIClient(apiConfiguration, logger)
  }
}
