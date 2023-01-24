import { Config } from '@oclif/core'
import AnalyticsCommand from '../../../helpers/AnalyticsCommand'

export default class MonthlyPckAnalytics extends AnalyticsCommand {
  static description =
    'Get Monthly PhoneCheck Analytics. The date range defaults to the current calendar month.'

  static flags = {
    ...AnalyticsCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'pck', 'monthly')
  }

  defaultSearch(): string {
    return `date>=${new Date().toISOString().substring(0, 7)}`
  }
}
