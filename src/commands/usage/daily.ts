import * as Config from '@oclif/config'
import UsageCommand from '../../helpers/UsageCommand'

export default class DailyUsage extends UsageCommand {

    static description = 'Get Daily Usage. The date range defaults to current date.'

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