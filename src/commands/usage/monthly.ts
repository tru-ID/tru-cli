import { Config } from '@oclif/core'
import UsageCommand from '../../helpers/UsageCommand'

export default class MonthlyUsage extends UsageCommand {
  static description =
    'Get Monthly Usage. The date range defaults to the current calendar month.'

  static flags = {
    ...UsageCommand.flags,
  }

  constructor(argv: string[], config: Config) {
    super(argv, config, 'monthly')
  }

  defaultSearch(): string {
    return `date>=${new Date().toISOString().substring(0, 7)}`
  }
}
