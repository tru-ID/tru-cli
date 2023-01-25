import { Config } from '@oclif/core'
import AnalyticsCommand from '../../../helpers/AnalyticsCommand'

export default class MonthlySckAnalytics extends AnalyticsCommand {
  static description =
    'Get Monthly SimCheck Analytics. By default returns most recent analytics.'

  static flags = {
    ...AnalyticsCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'sck', 'monthly')
  }
}
