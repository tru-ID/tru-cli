import * as Config from '@oclif/config'
import { APIConfiguration } from '../../api/APIConfiguration'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
import ILogger from '../../helpers/ILogger'
import ChecksTraceCommand from '../../helpers/ChecksTraceCommand'

export default class PhoneCheckTraces extends ChecksTraceCommand {
  static description = 'Get the traces of a PhoneCheck'

  static typeOfCheck = 'PhoneCheck'

  static flags = {
    ...ChecksTraceCommand.flags,
  }

  static args = [...ChecksTraceCommand.args]

  constructor(argv: string[], config: Config.IConfig) {
    super('PhoneCheck', 'phone_check', argv, config)
  }

  parseCommand() {
    return this.parse(PhoneCheckTraces)
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new PhoneChecksAPIClient(apiConfiguration, logger)
  }
}
