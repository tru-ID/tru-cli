import { CliUx, Flags } from '@oclif/core'
import {
  IListProjectsResponse,
  IProjectResource,
  ProjectsAPIClient,
} from '../../api/ProjectsAPIClient'
import { RefreshTokenManager } from '../../api/TokenManager'
import {
  apiBaseUrlDR,
  issuerUrl,
  loginBaseUrl,
  workspaceTokenUrl,
} from '../../DefaultUrls'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import { displayPagination } from '../../helpers/ux'
import {
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from '../../helpers/ValidationUtils'
import { logApiError, printJson } from '../../utilities'

export default class ProjectsList extends CommandWithGlobalConfig {
  static description =
    'Lists details for all Projects or a Projects that match a given criteria'

  static args = [
    {
      name: 'project_id',
      required: false,
      description: 'the project_id for the Project to retrieve',
    },
  ]

  static pageNumberFlag = Flags.integer({
    description: `the page number to return in the list resource. Ignored if the "project_id" argument is used.`,
    default: 1,
  })
  static pageSizeFlag = Flags.integer({
    description:
      'the page size to return in list resource request. Ignored if the "project_id" argument is used.',
    default: 10,
  })
  static searchFlag = Flags.string({
    description:
      'a RSQL search query. To ensure correct parsing put your query in quotes. For example "--search \'name=p*\'". Ignored if the "project_id" argument is used.',
  })
  static sortFlag = Flags.string({
    description:
      'sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or "created_at,desc". Ignored if the "project_id" argument is used.',
    default: 'created_at,desc',
  })

  static flags = {
    ...CommandWithGlobalConfig.flags,
    ...CliUx.ux.table.flags(),
    'page-number': ProjectsList.pageNumberFlag,
    'page-size': ProjectsList.pageSizeFlag,
    search: ProjectsList.searchFlag,
    sort: ProjectsList.sortFlag,
  }

  async run(): Promise<void> {
    const result = await this.parse(ProjectsList)
    this.args = result.args
    this.flags = result.flags

    await super.run()

    isWorkspaceTokenInfoValid(this.globalConfig!)
    isWorkspaceSelected(this.globalConfig!)

    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refreshToken,
        configLocation: this.getConfigPath(),
        tokenUrl: workspaceTokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    const projectsAPIClient = new ProjectsAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.globalConfig!.selectedWorkspaceDataResidency!,
        this.globalConfig!,
      ),
      this.logger,
    )

    try {
      if (this.args.project_id) {
        const singleResource = await projectsAPIClient.get(
          this.globalConfig!.selectedWorkspace!,
          this.args.project_id,
        )
        this.printResponse(singleResource, true)
      } else {
        const listResource = await projectsAPIClient.list(
          this.globalConfig!.selectedWorkspace!,
          {
            size: this.flags['page-size'],
            page: this.flags['page-number'],
            search: this.flags.search,
            sort: this.flags.sort,
          },
        )

        this.printResponse(listResource, false)
      }
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }
  printResponse(
    response: IProjectResource | IListProjectsResponse,
    printSingle?: boolean,
  ): void {
    if (this.flags.output === 'json') {
      printJson(this.logger, response)
      return
    }

    if (printSingle) {
      const singleResponse = response as IProjectResource
      this.printDefault([singleResponse])
      return
    }

    const listResponse = response as IListProjectsResponse
    this.printDefault(listResponse._embedded.projects)

    displayPagination(this.logger, listResponse.page, 'Projects')
  }

  printDefault(resources: IProjectResource[]): void {
    // do not use table sort as it only works for simple types e.g., number, etc.
    // and the API already returns sorted results
    const flagsWithNoSort = { ...this.flags, sort: undefined }

    CliUx.ux.table(
      resources,
      {
        name: {
          minWidth: 12,
          header: 'name',
        },
        project_id: {
          header: 'project_id',
        },
        created_at: {
          header: 'created_at',
        },
        url: {
          header: '_links.self.href',
          extended: true,
          get: (row: IProjectResource) => row._links.self.href,
        },
        phonecheck_callback_url: {
          header: 'configuration.phone_check.callback_url',
          extended: true,
          get: (row: IProjectResource) =>
            row.configuration?.phone_check?.callback_url,
        },
      },
      {
        printLine: (s: any) => {
          this.logger!.info(s)
        },
        ...flagsWithNoSort,
      },
    )
  }
}
