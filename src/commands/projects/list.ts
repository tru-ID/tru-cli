import { flags } from '@oclif/command'
import { cli } from 'cli-ux'
import { APIConfiguration } from '../../api/APIConfiguration'
import {
  IListProjectsResponse,
  IProjectResource,
  ProjectsAPIClient,
} from '../../api/ProjectsAPIClient'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import { displayPagination } from '../../helpers/ux'
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

  static pageNumberFlag = flags.integer({
    description: `The page number to return in the list resource. Ignored if the "project_id" argument is used.`,
    default: 1,
  })
  static pageSizeFlag = flags.integer({
    description:
      'The page size to return in list resource request. Ignored if the "project_id" argument is used.',
    default: 10,
  })
  static searchFlag = flags.string({
    description:
      'A RSQL search query. To ensure correct parsing put your query in quotes. For example "--search \'name=p*\'". Ignored if the "check_id" argument is used.',
  })
  static sortFlag = flags.string({
    description:
      'Sort query in the form "{parameter_name},{direction}". For example, "created_at,asc" or "created_at,desc". Ignored if the "check_id" argument is used.',
    //default: 'created_at,asc' API current expects createdAt so no default at present
  })

  static flags = {
    ...CommandWithGlobalConfig.flags,
    ...cli.table.flags(),
    page_number: ProjectsList.pageNumberFlag,
    page_size: ProjectsList.pageSizeFlag,
    search: ProjectsList.searchFlag,
    sort: ProjectsList.sortFlag,
  }

  async run() {
    const result = this.parse(ProjectsList)
    this.args = result.args
    this.flags = result.flags

    await super.run()

    const projectsAPIClient = new ProjectsAPIClient(
      new APIConfiguration({
        clientId: this.globalConfig?.defaultWorkspaceClientId,
        clientSecret: this.globalConfig?.defaultWorkspaceClientSecret,
        scopes: ['projects'],
        baseUrl:
          this.globalConfig?.apiBaseUrlOverride ??
          `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`,
      }),
      this.logger,
    )

    if (this.args.project_id) {
      let singleResource: IProjectResource
      try {
        singleResource = await projectsAPIClient.get(this.args.project_id)

        this.displayResults([singleResource])
      } catch (error) {
        logApiError(this.log, error)
        this.exit(1)
      }
    } else {
      let listResource: IListProjectsResponse
      try {
        listResource = await projectsAPIClient.list({
          size: this.flags.page_size,
          page: this.flags.page_number,
          search: this.flags.search,
          sort: this.flags.sort,
        })

        this.displayResults(listResource._embedded.projects)
        displayPagination(this.logger, listResource.page, 'Projects')
      } catch (error) {
        logApiError(this.log, error)
        this.exit(1)
      }
    }
  }

  displayResults(resources: IProjectResource[]) {
    cli.table(
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
        credentials_client_id: {
          header: 'credentials[0].client_id',
          extended: true,
          get: (row) => row.credentials[0].client_id,
        },
        url: {
          header: '_links.self.href',
          extended: true,
          get: (row) => row._links.self.href,
        },
        phonecheck_callback_url: {
          header: 'configuration.phone_check.callback_url',
          extended: true,
          get: (row) => row.configuration?.phone_check?.callback_url,
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
