import { CliUx, Config, Flags } from '@oclif/core'
import { RefreshTokenManager } from '../api/TokenManager'
import { IListUsageResource, UsageApiClient } from '../api/UsageAPIClient'
import {
  apiBaseUrlDR,
  issuerUrl,
  loginBaseUrl,
  workspaceTokenUrl,
} from '../DefaultUrls'
import CommandWithGlobalConfig from '../helpers/CommandWithGlobalConfig'
import ILogger from '../helpers/ILogger'
import { displayPagination } from './ux'
import { logApiError } from '../utilities'
import {
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from './ValidationUtils'

export default abstract class UsageCommand extends CommandWithGlobalConfig {
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
      description: `the RSQL query for usage. date is required e.g --search='date>=2021-03-29'`,
      required: false,
    }),
    'group-by': Flags.string({
      description:
        'group results by one or more fields e.g product_id or project_id or product_id,project_id',
      required: false,
    }),
    'page-number': UsageCommand.pageNumberFlag,
    'page-size': UsageCommand.pageSizeFlag,
  }

  tokenScope: string

  typeOfUsage: string

  protected constructor(argv: string[], config: Config, typeOfUsage: string) {
    super(argv, config)
    this.tokenScope = 'usage'
    this.typeOfUsage = typeOfUsage
  }

  getApiClient(logger: ILogger): UsageApiClient {
    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refreshToken!,
        configLocation: this.getConfigPath(),
        tokenUrl: workspaceTokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    return new UsageApiClient(
      tokenManager,
      apiBaseUrlDR(
        this.globalConfig!.selectedWorkspaceDataResidency!,
        this.globalConfig!,
      ),
      logger,
    )
  }

  printDefault(listResource: IListUsageResource): void {
    if (listResource._embedded.usage.length > 0) {
      //Dynamic add columns
      const resources = listResource._embedded.usage

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
        ...this.flags,
      })
    }

    displayPagination(this.logger, listResource.page, `Usages`)
  }

  async run(): Promise<void> {
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
      page: this.flags['page-number'],
      size: this.flags['page-size'],
    }

    try {
      const listResource = await apiCheckClient.getUsage(
        this.globalConfig!.selectedWorkspace!,
        usageParams,
        this.typeOfUsage,
      )

      this.printResponse(listResource)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }

  abstract defaultSearch(): string
}
