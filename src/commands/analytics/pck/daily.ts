import { Config } from '@oclif/core'
import AnalyticsCommand from '../../../helpers/AnalyticsCommand'

export default class DailyPckAnalytics extends AnalyticsCommand {
  static description =
    'Get Daily PhoneCheck Analytics. The date range defaults to current date.'

  static flags = {
    ...AnalyticsCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'pck', 'daily')
  }

  defaultSearch(): string {
    return `date>=${new Date().toISOString().substring(0, 10)}`
  }
}
