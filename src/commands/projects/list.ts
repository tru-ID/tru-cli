import { cli } from 'cli-ux'

import { ConsoleLogger, LogLevel } from '../../helpers/ConsoleLogger'
import { APIConfiguration } from '../../api/APIConfiguration'
import { ProjectsAPIClient, IProjectResource, IListProjectsResponse } from '../../api/ProjectsAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'

export default class ProjectsList extends CommandWithProjectConfig {
    static description = 'Lists details for all Projects or a Projects that match a given criteria'

    static flags = {
        ...CommandWithProjectConfig.flags,
        ...cli.table.flags()
    }

    static args = [
        {
            name: 'project_id',
            required: false,
            description: 'The project_id for the Project to retrieve'
        }
    ]

    logger?: ILogger

    async run() {
        const result = this.parse(ProjectsList)
        this.args = result.args
        this.flags = result.flags
        await this.loadConfig()

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
                listResource = await projectsAPIClient.list()

                this.logger.debug(JSON.stringify(listResource, null, 2))

                this.displayResults(listResource._embedded.projects)
                this.displayPagination(listResource.page, 'Projects')

                cli.table
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

    displayPagination(pagination: any, description: string) {
        this.logger?.info('')
        this.logger?.info(`Total ${description}: ${pagination.total_elements}`)
        this.logger?.info(`Page ${pagination.number} of ${pagination.total_pages}`)
    }

}
