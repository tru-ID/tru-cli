import { CliUx, Config, Flags } from '@oclif/core'
import {
  AnalyticsApiClient,
  IListAnalyticsResource,
} from '../api/AnalyticsAPIClient'
import { RefreshTokenManager } from '../api/TokenManager'
import {
  apiBaseUrlDR,
  issuerUrl,
  loginBaseUrl,
  workspaceTokenUrl,
} from '../DefaultUrls'
import CommandWithGlobalConfig from '../helpers/CommandWithGlobalConfig'
import ILogger from '../helpers/ILogger'
import { displayPagination } from '../helpers/ux'
import { logApiError } from '../utilities'
import {
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from './ValidationUtils'

export default abstract class AnalyticsCommand extends CommandWithGlobalConfig {
  static pageNumberFlag = Flags.integer({
    description: `the page number to return in the list resource.`,
    default: 1,
  })
  static pageSizeFlag = Flags.integer({
    description: 'the page size to return in list resource request.',
    default: 10,
  })

  static flags = {
    ...CommandWithGlobalConfig.flags,
    ...CliUx.ux.table.flags(),
    search: Flags.string({
      description: `the RSQL query for analytics. e.g --search='date>=2021-03-29'`,
      required: false,
    }),
    'group-by': Flags.string({
      description:
        'group results by one or more fields e.g project_id or network_id',
      required: false,
    }),
    'page-number': AnalyticsCommand.pageNumberFlag,
    'page-size': AnalyticsCommand.pageSizeFlag,
    sort: Flags.string({
      description: `sort query in the form "{parameter_name},{direction}". For example, "date,asc" or "date,desc".`,
      required: false,
    }),
  }

  tokenScope: string

  productId: string

  timeBucket: string

  constructor(
    argv: string[],
    config: Config,
    productId: string,
    timeBucket: string,
  ) {
    super(argv, config)
    this.tokenScope = 'console'
    this.timeBucket = timeBucket
    this.productId = productId
  }

  getApiClient(logger: ILogger): AnalyticsApiClient {
    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refreshToken!,
        configLocation: this.getConfigPath(),
        tokenUrl: workspaceTokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    return new AnalyticsApiClient(
      tokenManager,
      apiBaseUrlDR(
        this.globalConfig!.selectedWorkspaceDataResidency!,
        this.globalConfig!,
      ),
      logger,
    )
  }

  async run(): Promise<void> {
    const result = await this.parse(AnalyticsCommand)

    this.args = result.args
    this.flags = result.flags

    await super.run()

    isWorkspaceTokenInfoValid(this.globalConfig!)
    isWorkspaceSelected(this.globalConfig!)

    const apiCheckClient = this.getApiClient(this.logger)

    const analyticsParams = {
      search: this.flags.search,
      group_by: this.flags[`group-by`],
      page: this.flags['page-number'],
      size: this.flags['page-size'],
      sort: this.flags.sort,
    }

    try {
      const listResource = await apiCheckClient.getAnalytics(
        this.globalConfig!.selectedWorkspace!,
        analyticsParams,
        this.productId,
        this.timeBucket,
      )

      this.printResponse(listResource)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }

  printDefault(listResource: IListAnalyticsResource): void {
    if (listResource._embedded.analytics.length > 0) {
      const resources = listResource._embedded.analytics
      //Dynamic add columns
      const columns: { [k: string]: any } = {}

      const params = Object.getOwnPropertyNames(resources[0])

      for (const param of params) {
        columns[`${param}`] = {
          header: `${param}`,
        }
      }

      CliUx.ux.table(resources, columns, {
        printLine: (s: any) => {
          this.logger!.info(s)
        },
        ...this.flags, // parsed flags
      })
    }

    displayPagination(this.logger, listResource.page, `Analytics`)
  }
}
