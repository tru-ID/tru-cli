import { Config } from '@oclif/core'
import AnalyticsCommand from '../../../helpers/AnalyticsCommand'

export default class DailySukAnalytics extends AnalyticsCommand {
  static description =
    'Get Daily SubscriberCheck Analytics. By default returns most recent analytics.'

  static flags = {
    ...AnalyticsCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'suk', 'daily')
  }
}
