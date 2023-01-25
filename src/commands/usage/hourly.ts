import { Config } from '@oclif/core'
import UsageCommand from '../../helpers/UsageCommand'

export default class HourlyUsage extends UsageCommand {
  static description =
    'Get Hourly Usage. The date range defaults to the last 12 hours.'

  static flags = {
    ...UsageCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'hourly')
  }

  defaultSearch(): string {
    const date = new Date()
    date.setHours(date.getHours() - 12)

    return `date>=${date.toISOString().substring(0, 13)}`
  }
}
