import { flags } from '@oclif/command'
import { cli } from 'cli-ux'

import {ConsoleLogger, LogLevel} from '../../helpers/ConsoleLogger'
import {APIConfiguration} from '../../api/APIConfiguration'
import { PhoneChecksAPIClient, IPhoneCheckResource, IListPhoneCheckResponse } from '../../api/PhoneChecksAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import { displayPagination } from '../../helpers/ux'
import ILogger from '../../helpers/ILogger'

export default class PhoneChecksList extends CommandWithProjectConfig {
  static description = 'Lists details for all Phone Checks or a specific Phone Check if the a check-id argument is passed'

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
    ...CommandWithProjectConfig.flags,
    ...cli.table.flags(),
    page_number: PhoneChecksList.pageNumberFlag,
    page_size: PhoneChecksList.pageSizeFlag,
    search: PhoneChecksList.searchFlag,
    sort: PhoneChecksList.sortFlag
  }

  static args = [
    {
        name: 'check_id',
        required: false,
        description: 'The check_id for the Phone Check to list'
    }
  ]

  logger?: ILogger

  async run() {
    const result = this.parse(PhoneChecksList)
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    // TODO: move to CommandWithGlobalConfig
    this.logger = new ConsoleLogger(!this.flags.debug ? LogLevel.info : LogLevel.debug)
    this.logger.debug('--debug', true)

    const phoneCheckAPIClient = new PhoneChecksAPIClient(new APIConfiguration({
          clientId: this.projectConfig?.credentials[0].client_id,
          clientSecret: this.projectConfig?.credentials[0].client_secret,
          scopes: ['phone_check'],
          baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.4auth.io`
      }),
      this.logger
    )

    if(this.args.check_id) {
      let singleResource:IPhoneCheckResource
      try {
        singleResource = await phoneCheckAPIClient.get(this.args.check_id)

        this.displayResults([singleResource])
      }
      catch(error) {
        this.log('API Error:',
          `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, 2) : '')}`)
        this.exit(1)
      }
    }
    else {
      let listResource:IListPhoneCheckResponse
      try {
        listResource = await phoneCheckAPIClient.list({
          page: this.flags.page_number,
          size: this.flags.page_size,
          search: this.flags.search,
          sort: this.flags.sort
        })

        this.displayResults(listResource._embedded.checks)
        displayPagination(this.logger, listResource.page, 'Phone Checks')
      }
      catch(error) {
        this.log('API Error:',
          `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, 2) : '')}`)
        this.exit(1)
      }
    }
  }

  displayResults(resources: IPhoneCheckResource[]) {
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
