import { Config } from '@oclif/core'
import UsageCommand from '../../helpers/UsageCommand'

export default class DailyUsage extends UsageCommand {
  static description =
    'Get Daily Usage. The date range defaults to the last 7 days.'

  static flags = {
    ...UsageCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'daily')
  }

  defaultSearch(): string {
    const date = new Date()
    date.setDate(date.getDate() - 7)

    return `date>=${date.toISOString().substring(0, 10)}`
  }
}
