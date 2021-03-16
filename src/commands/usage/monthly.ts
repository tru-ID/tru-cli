import * as Config from '@oclif/config'
import UsageCommand from '../../helpers/UsageCommand'

export default class MonthlyUsage extends UsageCommand {

    static description = 'Get Monthly Usage'


    static flags = {
        ...UsageCommand.flags
    }

    constructor(argv: string[], config: Config.IConfig) {
        super( argv, config, 'monthly')
    }

}