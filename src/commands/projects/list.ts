import { flags } from '@oclif/command'
import { cli } from 'cli-ux'

import { ConsoleLogger, LogLevel } from '../../helpers/ConsoleLogger'
import { APIConfiguration } from '../../api/APIConfiguration'
import { ProjectsAPIClient, IProjectResource, IListProjectsResponse } from '../../api/ProjectsAPIClient'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import ILogger from '../../helpers/ILogger'
import { IListResource, IPageNumbers } from '../../api/IListResource'

export default class ProjectsList extends CommandWithGlobalConfig {
    static description = 'Lists details for all Projects or a Projects that match a given criteria'

    static args = [
        {
            name: 'project_id',
            required: false,
            description: 'The project_id for the Project to retrieve'
        }
    ]

    static pageNumberFlag = flags.integer({
        description: `The page number to return in the list resource. Ignored if the "project_id" argument is used.`,
        default: 1
    })
    static pageSizeFlag = flags.integer({
        description: 'The page size to return in list resource request. Ignored if the "project_id" argument is used.',
        default: 10
    })

    static flags = {
        ...CommandWithGlobalConfig.flags,
        ...cli.table.flags(),
        page_number: ProjectsList.pageNumberFlag,
        page_size: ProjectsList.pageSizeFlag
    }

    logger?: ILogger

    async run() {
        const result = this.parse(ProjectsList)
        this.args = result.args
        this.flags = result.flags

        // TODO: move to CommandWithGlobalConfig
        this.logger = new ConsoleLogger(!this.flags.debug ? LogLevel.info : LogLevel.debug)
        this.logger.debug('--debug', true)

        const projectsAPIClient = new ProjectsAPIClient(new APIConfiguration({
            clientId: this.globalConfig?.defaultWorkspaceClientId,
            clientSecret: this.globalConfig?.defaultWorkspaceClientSecret,
            scopes: ['projects'],
            baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.4auth.io`
        }),
            this.logger
        )

        if (this.args.project_id) {
            let singleResource: IProjectResource
            try {
                singleResource = await projectsAPIClient.get(this.args.project_id)

                this.logger.debug(JSON.stringify(singleResource, null, 2))

                this.displayResults([singleResource])
            }
            catch (error) {
                this.log('API Error:',
                    `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
                this.exit(1)
            }
        }
        else {
            let listResource: IListProjectsResponse
            try {
                listResource = await projectsAPIClient.list({
                    size: this.flags.page_size,
                    page: this.flags.page_number
                })

                this.logger.debug(JSON.stringify(listResource, null, 2))

                this.displayResults(listResource._embedded.projects)
                this.displayPagination(listResource.page, 'Projects')
            }
            catch (error) {
                this.log('API Error:',
                    `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
                this.exit(1)
            }
        }
    }

    displayResults(resources: IProjectResource[]) {
        cli.table(resources, {
            name: {
                minWidth: 12,
            },
            project_id: {
                header: 'ID'
            },
            created_at: {
            },
            credentials_client_id: {
                header: '1st Credentials client_id',
                extended: true,
                get: row => row.credentials[0].client_id
            },
            url: {
                extended: true,
                get: row => row._links.self.href
            }
        }, {
            printLine: (s: any) => { this.logger!.info(s) },
            ...this.flags, // parsed flags
        })
    }

    displayPagination(pagination: IPageNumbers, description: string) {
        const startIndex = (pagination.number-1) * pagination.size
        const start = Math.max(1, startIndex)
        const end = (startIndex + pagination.size <= pagination.total_elements?startIndex + pagination.size:pagination.total_elements)
        this.logger?.info('')
        this.logger?.info(`${description}: ${start} to ${end} of ${pagination.total_elements}`)
        this.logger?.info(`Page ${pagination.number} of ${pagination.total_pages}`)
    }

}
