import { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import * as Config from '@oclif/config'

import { APIConfiguration } from '../../api/APIConfiguration'
import { PhoneChecksAPIClient } from '../../api/PhoneChecksAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import ChecksListCommand from '../../helpers/ChecksListCommand'
import { AbstractChecksApiClient, CheckResource, ICreateCheckResponse } from '../../api/ChecksAPIClient'

export default class PhoneChecksList extends ChecksListCommand<ICreateCheckResponse> {
  static description = 'Lists details for all PhoneChecks or a specific PhoneCheck if the a check-id argument is passed'

  static pageNumberFlag = flags.integer({
    description: `The page number to return in the list resource. Ignored if the "check_id" argument is used.`,
    default: 1
  })
  static pageSizeFlag = flags.integer({
    description: 'The page size to return in list resource request. Ignored if the "check_id" argument is used.',
    default: 10
  })
  static searchFlag = flags.string({
    description: 'A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search \'status==COMPLETED\'". Ignored if the "check_id" argument is used.'
  })
  static sortFlag = flags.string({
    description: 'Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.',
    //default: 'created_at,asc' API current expects createdAt so no default at present
  })

  static flags = {
    ...ChecksListCommand.flags   
  }

  static args = [
    {
      name: 'check_id',
      required: false,
      description: 'The check_id for the PhoneCheck to list'
    }
  ]

  constructor(argv: string[], config: Config.IConfig) {
    super("PhoneCheck", "phone_check", argv, config)
  }

  parseCommand() {
    return this.parse(PhoneChecksList);
  }

  getApiClient(apiConfiguration: APIConfiguration, logger: ILogger) {
    return new PhoneChecksAPIClient(apiConfiguration, logger)
  }

  displayResults(resources: CheckResource[]) {
    cli.table(resources, {
      check_id: {
        header: 'check_id'
      },
      created_at: {
        header: 'created_at'
      },
      status: {
        header: 'status'
      },
      match: {
        header: 'match'
      },
      charge_currency: {
        header: 'charge_currency'
      },
      charge_amount: {
        header: 'charge_amount'
      },
      updated_at: {
        header: 'updated_at',
        extended: true
      },
      url: {
        extended: true,
        header: '_links.self.href',
        get: row => row._links.self.href
      }
    }, {
      printLine: (s: any) => { this.logger!.info(s) },
      ...this.flags, // parsed flags
    })
  }



}
