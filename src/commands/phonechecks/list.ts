import { CliUx, Config, Flags } from '@oclif/core'
import { APIConfiguration } from '../../api/APIConfiguration'
import { CheckResource } from '../../api/ChecksAPIClient'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
import ChecksListCommand from '../../helpers/ChecksListCommand'
import ILogger from '../../helpers/ILogger'

export default class PhoneChecksList extends ChecksListCommand {
  static description =
    'Lists details for all PhoneChecks or a specific PhoneCheck if the a check-id argument is passed'

  static pageNumberFlag = Flags.integer({
    description: `The page number to return in the list resource. Ignored if the "check_id" argument is used.`,
    default: 1,
  })
  static pageSizeFlag = Flags.integer({
    description:
      'The page size to return in list resource request. Ignored if the "check_id" argument is used.',
    default: 10,
  })
  static searchFlag = Flags.string({
    description:
      'A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search \'status==COMPLETED\'". Ignored if the "check_id" argument is used.',
  })
  static sortFlag = Flags.string({
    description:
      'Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.',
    //default: 'created_at,asc' API current expects createdAt so no default at present
  })

  static flags = {
    ...ChecksListCommand.flags,
  }

  static args = [
    {
      name: 'check_id',
      required: false,
      description: 'The check_id for the PhoneCheck to list',
    },
  ]

  constructor(argv: string[], config: Config) {
    super('PhoneCheck', 'phone_check', argv, config)
  }

  async parseCommand() {
    const command = await this.parse(PhoneChecksList)
    return command
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new PhoneChecksAPIClient(apiConfiguration, logger)
  }

  displayResults(resources: CheckResource[]) {
    CliUx.ux.table(
      resources,
      {
        check_id: {
          header: 'check_id',
        },
        created_at: {
          header: 'created_at',
        },
        status: {
          header: 'status',
        },
        match: {
          header: 'match',
        },
        charge_currency: {
          header: 'charge_currency',
        },
        charge_amount: {
          header: 'charge_amount',
        },
        updated_at: {
          header: 'updated_at',
          extended: true,
        },
        url: {
          extended: true,
          header: '_links.self.href',
          get: (row) => row._links.self.href,
        },
      },
      {
        printLine: (s: any) => {
          this.logger!.info(s)
        },
        ...this.flags, // parsed flags
      },
    )
  }
}
