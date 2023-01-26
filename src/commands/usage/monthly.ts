import { Config } from '@oclif/core'
import UsageCommand from '../../helpers/UsageCommand'

export default class MonthlyUsage extends UsageCommand {
  static description =
    'Get Monthly Usage. The date range defaults to the last 6 months.'

  static flags = {
    ...UsageCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'monthly')
  }

  defaultSearch(): string {
    const date = new Date()
    date.setMonth(date.getMonth() - 6)

    return `date>=${date.toISOString().substring(0, 7)}`
  }
}
