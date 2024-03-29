import { CliUx, Config, Flags } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../api/APIConfiguration'
import {
  AbstractChecksApiClient,
  CheckResponse,
  IListCheckResource,
} from '../api/ChecksAPIClient'
import { tokenUrlDR } from '../DefaultUrls'
import { displayPagination } from '../helpers/ux'
import { logApiError, printJson } from '../utilities'
import CommandWithProjectConfig from './CommandWithProjectConfig'
import ILogger from './ILogger'
import {
  doesProjectConfigExist,
  isProjectCredentialsValid,
} from './ValidationUtils'

export default abstract class ChecksListCommand extends CommandWithProjectConfig {
  static pageNumberFlag = Flags.integer({
    description: `the page number to return in the list resource. Ignored if the "check_id" argument is used.`,
    default: 1,
  })
  static pageSizeFlag = Flags.integer({
    description:
      'the page size to return in list resource request. Ignored if the "check_id" argument is used.',
    default: 10,
  })
  static searchFlag = Flags.string({
    description:
      'a RSQL search query. To ensure correct parsing put your query in quotes. For example "--search \'status==COMPLETED\'". Ignored if the "check_id" argument is used.',
  })
  static sortFlag = Flags.string({
    description:
      'sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.',
    default: 'created_at,desc',
  })

  static args = [
    {
      name: 'check_id',
      required: false,
      description: 'the check_id for the Check to list',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...CliUx.ux.table.flags(),
    'page-number': ChecksListCommand.pageNumberFlag,
    'page-size': ChecksListCommand.pageSizeFlag,
    search: ChecksListCommand.searchFlag,
    sort: ChecksListCommand.sortFlag,
  }

  typeOfCheck: string

  tokenScope: string

  protected constructor(
    typeOfCheck: string,
    tokenScope: string,
    argv: string[],
    config: Config,
  ) {
    super(argv, config)
    this.typeOfCheck = typeOfCheck
    this.tokenScope = tokenScope
  }

  abstract parseCommand(): Promise<any>

  abstract getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,
    logger: ILogger,
  ): AbstractChecksApiClient<any, any>

  async run(): Promise<void> {
    const result = await this.parseCommand()
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    await super.run()

    doesProjectConfigExist(this.projectConfig)
    isProjectCredentialsValid(this.projectConfig!)

    if (!this.projectConfig?.data_residency) {
      this.warn(
        'No data_residency specified in project config tru.json. It will default to eu',
      )
    }

    const apiConfiguration: APIClientCredentialsConfiguration = {
      clientId: this.projectConfig!.credentials[0].client_id!,
      clientSecret: this.projectConfig!.credentials[0].client_secret!,
      scopes: [this.tokenScope],
      tokenUrl: tokenUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
    }

    const checkApiClient = this.getApiClient(apiConfiguration, this.logger)

    if (this.args.check_id) {
      try {
        const singleResource = await checkApiClient.get(this.args.check_id)

        this.printResponse(singleResource, true)
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    } else {
      try {
        const listResource = await checkApiClient.list({
          page: this.flags['page-number'],
          size: this.flags['page-size'],
          search: this.flags.search,
          sort: this.flags.sort,
        })

        this.printResponse(listResource, false)
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    }
  }

  printResponse(
    response: CheckResponse | IListCheckResource<CheckResponse>,
    printSingle?: boolean,
  ): void {
    if (this.flags.output === 'json') {
      printJson(this.logger, response)
      return
    }

    if (printSingle) {
      this.printDefault([response])
      return
    }

    const listResponse = response as IListCheckResource<CheckResponse>
    this.printDefault(listResponse._embedded.checks)

    displayPagination(this.logger, listResponse.page, `${this.typeOfCheck}s`)
  }
}
