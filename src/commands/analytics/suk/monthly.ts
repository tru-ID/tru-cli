import { Config } from '@oclif/core'
import AnalyticsCommand from '../../../helpers/AnalyticsCommand'

export default class MonthlySukAnalytics extends AnalyticsCommand {
  static description =
    'Get Monthly SubscriberCheck Analytics. The date range defaults to the current calendar month.'

  static flags = {
    ...AnalyticsCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'suk', 'monthly')
  }

  defaultSearch(): string {
    return `date>=${new Date().toISOString().substring(0, 7)}`
  }
}
