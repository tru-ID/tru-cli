import { Config } from '@oclif/core'
import { APIConfiguration } from '../../api/APIConfiguration'
import { SimCheckAPIClient } from '../../api/SimCheckAPIClient'
import ChecksTraceCommand from '../../helpers/ChecksTraceCommand'
import ILogger from '../../helpers/ILogger'

export default class SimCheckTraces extends ChecksTraceCommand {
  static description = 'Get the traces of a SIMCheck'

  static typeOfCheck = 'SIMCheck'

  static flags = {
    ...ChecksTraceCommand.flags,
  }

  static args = [...ChecksTraceCommand.args]

  constructor(argv: string[], config: Config) {
    super('SIMCheck', 'sim_check', argv, config)
  }

  parseCommand() {
    return this.parse(SimCheckTraces)
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new SimCheckAPIClient(apiConfiguration, logger)
  }
}
