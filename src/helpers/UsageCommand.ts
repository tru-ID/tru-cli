import { CliUx, Config, Flags } from '@oclif/core'
import { RefreshTokenManager } from '../api/TokenManager'
import { UsageApiClient, UsageResource } from '../api/UsageAPIClient'
import { apiBaseUrlDR, issuerUrl, loginBaseUrl, tokenUrl } from '../DefaultUrls'
import CommandWithGlobalConfig from '../helpers/CommandWithGlobalConfig'
import ILogger from '../helpers/ILogger'
import { displayPagination } from '../helpers/ux'
import { logApiError } from '../utilities'
import {
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from './ValidationUtils'

export default abstract class UsageCommand extends CommandWithGlobalConfig {
  static pageNumberFlag = Flags.integer({
    description: `The page number to return in the list resource.`,
    default: 1,
  })
  static pageSizeFlag = Flags.integer({
    description: 'The page size to return in list resource request.',
    default: 10,
  })

  static flags = {
    ...CommandWithGlobalConfig.flags,
    ...CliUx.ux.table.flags(),
    search: Flags.string({
      description: `The RSQL query for usage. date is required e.g --search='date>=2021-03-29'`,
      required: false,
    }),
    'group-by': Flags.string({
      description:
        'Group results by one or more fields e.g product_id or project_id or product_id,project_id',
      required: false,
    }),
    page_number: UsageCommand.pageNumberFlag,
    page_size: UsageCommand.pageSizeFlag,
  }

  tokenScope: string

  typeOfUsage: string

  constructor(argv: string[], config: Config, typeOfUsage: string) {
    super(argv, config)
    this.tokenScope = 'usage'
    this.typeOfUsage = typeOfUsage
  }

  getApiClient(logger: ILogger): UsageApiClient {
    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refresh_token!,
        configLocation: this.getConfigPath(),
        tokenUrl: tokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    return new UsageApiClient(
      tokenManager,
      apiBaseUrlDR(this.globalConfig!),
      logger,
    )
  }

  displayResults(resources: UsageResource[]) {
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

  async run() {
    const result = await this.parse(UsageCommand)

    this.args = result.args
    this.flags = result.flags

    await super.run()

    isWorkspaceTokenInfoValid(this.globalConfig!)
    isWorkspaceSelected(this.globalConfig!)

    const apiCheckClient = this.getApiClient(this.logger)

    const usageParams = {
      search: this.flags.search ?? this.defaultSearch(),
      group_by: this.flags[`group-by`],
      page: this.flags.page_number,
      size: this.flags.page_size,
    }

    try {
      const listResource = await apiCheckClient.getUsage(
        this.globalConfig!.selectedWorkspace!,
        usageParams,
        this.typeOfUsage,
      )

      if (listResource._embedded.usage.length > 0) {
        this.displayResults(listResource._embedded.usage)
      }

      displayPagination(this.logger, listResource.page, `Usages`)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }

  abstract defaultSearch(): string
}
