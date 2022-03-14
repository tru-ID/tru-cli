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
  tokenUrl,
} from '../../DefaultUrls'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import { displayPagination } from '../../helpers/ux'
import {
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from '../../helpers/ValidationUtils'
import { logApiError } from '../../utilities'

export default class ProjectsList extends CommandWithGlobalConfig {
  static description =
    'Lists details for all Projects or a Projects that match a given criteria'

  static args = [
    {
      name: 'project_id',
      required: false,
      description: 'The project_id for the Project to retrieve',
    },
  ]

  static pageNumberFlag = Flags.integer({
    description: `The page number to return in the list resource. Ignored if the "project_id" argument is used.`,
    default: 1,
  })
  static pageSizeFlag = Flags.integer({
    description:
      'The page size to return in list resource request. Ignored if the "project_id" argument is used.',
    default: 10,
  })
  static searchFlag = Flags.string({
    description:
      'A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search \'name=p*\'". Ignored if the "check_id" argument is used.',
  })
  static sortFlag = Flags.string({
    description:
      'Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.',
    //default: 'created_at,asc' API current expects createdAt so no default at present
  })

  static flags = {
    ...CommandWithGlobalConfig.flags,
    ...CliUx.ux.table.flags(),
    page_number: ProjectsList.pageNumberFlag,
    page_size: ProjectsList.pageSizeFlag,
    search: ProjectsList.searchFlag,
    sort: ProjectsList.sortFlag,
  }

  async run() {
    const result = await this.parse(ProjectsList)
    this.args = result.args
    this.flags = result.flags

    await super.run()

    isWorkspaceTokenInfoValid(this.globalConfig!)
    isWorkspaceSelected(this.globalConfig!)

    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refresh_token,
        configLocation: this.getConfigPath(),
        tokenUrl: tokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    const projectsAPIClient = new ProjectsAPIClient(
      tokenManager,
      apiBaseUrlDR(this.globalConfig!),
      this.logger,
    )

    if (this.args.project_id) {
      let singleResource: IProjectResource
      try {
        singleResource = await projectsAPIClient.get(
          this.globalConfig!.selectedWorkspace!,
          this.args.project_id,
        )

        this.displayResults([singleResource])
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    } else {
      let listResource: IListProjectsResponse
      try {
        listResource = await projectsAPIClient.list(
          this.globalConfig!.selectedWorkspace!,
          {
            size: this.flags.page_size,
            page: this.flags.page_number,
            search: this.flags.search,
            sort: this.flags.sort,
          },
        )

        this.displayResults(listResource._embedded.projects)
        displayPagination(this.logger, listResource.page, 'Projects')
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    }
  }

  displayResults(resources: IProjectResource[]): void {
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
        ...this.flags, // parsed flags
      },
    )
  }
}
