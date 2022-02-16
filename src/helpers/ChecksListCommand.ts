import { CliUx, Config, Flags } from '@oclif/core'
import { APIConfiguration } from '../api/APIConfiguration'
import {
  AbstractChecksApiClient,
  CheckResource,
  IListCheckResource,
} from '../api/ChecksAPIClient'
import { displayPagination } from '../helpers/ux'
import { logApiError } from '../utilities'
import CommandWithProjectConfig from './CommandWithProjectConfig'
import ILogger from './ILogger'

export default abstract class ChecksListCommand extends CommandWithProjectConfig {
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
  })

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...CliUx.ux.table.flags(),
    page_number: ChecksListCommand.pageNumberFlag,
    page_size: ChecksListCommand.pageSizeFlag,
    search: ChecksListCommand.searchFlag,
    sort: ChecksListCommand.sortFlag,
  }

  typeOfCheck: string

  tokenScope: string

  constructor(
    typeOfCheck: string,
    tokenScope: string,
    argv: string[],
    config: Config,
  ) {
    super(argv, config)
    this.typeOfCheck = typeOfCheck
    this.tokenScope = tokenScope
  }

  abstract parseCommand(): any

  abstract getApiClient(
    apiConfiguration: APIConfiguration,
    logger: ILogger,
  ): AbstractChecksApiClient<CheckResource>

  async run() {
    const result = await this.parseCommand()
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    await super.run()

    const apiConfiguration = new APIConfiguration({
      clientId: this.projectConfig?.credentials[0].client_id,
      clientSecret: this.projectConfig?.credentials[0].client_secret,
      scopes: [this.tokenScope],
      baseUrl:
        this.globalConfig?.apiBaseUrlOverride ??
        `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`,
    })

    const apiCheckClient = this.getApiClient(apiConfiguration, this.logger)

    if (this.args.check_id) {
      let singleResource: CheckResource
      try {
        singleResource = await apiCheckClient.get(this.args.check_id)

        this.displayResults([singleResource])
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    } else {
      let listResource: IListCheckResource<CheckResource>
      try {
        listResource = await apiCheckClient.list({
          page: this.flags.page_number,
          size: this.flags.page_size,
          search: this.flags.search,
          sort: this.flags.sort,
        })
        this.displayResults(listResource._embedded.checks)
        displayPagination(
          this.logger,
          listResource.page,
          `${this.typeOfCheck}s`,
        )
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    }
  }

  abstract displayResults(resources: CheckResource[]): any
}
