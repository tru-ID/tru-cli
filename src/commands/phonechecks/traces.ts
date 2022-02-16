import { Config } from '@oclif/core'
import { APIConfiguration } from '../../api/APIConfiguration'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
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

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new PhoneChecksAPIClient(apiConfiguration, logger)
  }
}
