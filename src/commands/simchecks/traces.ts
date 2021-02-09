import * as Config from '@oclif/config'
import { APIConfiguration } from '../../api/APIConfiguration'
import { SubscriberCheckAPIClient } from '../../api/SubscriberCheckAPIClient'
import ILogger from '../../helpers/ILogger'
import ChecksTraceCommand from '../../helpers/ChecksTraceCommand'
import { SimCheckAPIClient } from '../../api/SimCheckAPIClient'

export default class SimCheckTraces extends ChecksTraceCommand {

    static description = 'Get the traces of a SIMCheck'

    static typeOfCheck = "SIMCheck"

    static flags = {
        ...ChecksTraceCommand.flags
    }

    static args = [
        ...ChecksTraceCommand.args
    ]


    constructor(argv: string[], config: Config.IConfig) {
        super("SIMCheck", "sim_check", argv, config)
    }

    parseCommand() {
        return this.parse(SimCheckTraces);
    }

    getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
        return new SimCheckAPIClient(apiConfiguration, logger)
    }

}
