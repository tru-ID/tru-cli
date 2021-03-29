import * as Config from '@oclif/config'
import UsageCommand from '../../helpers/UsageCommand'

export default class DailyUsage extends UsageCommand {

    static description = 'Get Daily Usage'


    static flags = {
        ...UsageCommand.flags
    }

    constructor(argv: string[], config: Config.IConfig) {
        super(argv, config, 'daily')
    }

    defaultSearch(): string {

        return `date>=${new Date().toISOString().substring(0, 10)}`;

    }


}