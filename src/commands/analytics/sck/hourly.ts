import { Config } from '@oclif/core'
import AnalyticsCommand from '../../../helpers/AnalyticsCommand'

export default class HourlySckAnalytics extends AnalyticsCommand {
  static description =
    'Get Hourly SimCheck Analytics. The date range defaults to current date.'

  static flags = {
    ...AnalyticsCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'sck', 'hourly')
  }

  defaultSearch(): string {
    return `date>=${new Date().toISOString().substring(0, 10)}`
  }
}
