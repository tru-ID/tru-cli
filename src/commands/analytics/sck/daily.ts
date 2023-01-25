import { Config } from '@oclif/core'
import AnalyticsCommand from '../../../helpers/AnalyticsCommand'

export default class DailySckAnalytics extends AnalyticsCommand {
  static description =
    'Get Daily SimCheck Analytics. By default returns most recent analytics.'

  static flags = {
    ...AnalyticsCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'sck', 'daily')
  }
}
