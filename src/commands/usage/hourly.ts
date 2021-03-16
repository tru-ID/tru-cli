import * as Config from '@oclif/config'
import UsageCommand from '../../helpers/UsageCommand'

export default class HourlyUsage extends UsageCommand {

    static description = 'Get Hourly Usage'

    static flags = {
        ...UsageCommand.flags
    }

    constructor(argv: string[], config: Config.IConfig) {
        super(argv, config, 'hourly')
    }


}