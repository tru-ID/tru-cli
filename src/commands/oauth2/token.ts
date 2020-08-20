import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import { APIConfiguration } from '../../api/APIConfiguration'
import { ConsoleLogger, LogLevel } from '../../helpers/ConsoleLogger'
import { OAuth2APIClient } from '../../api/OAuth2APIClient'
import ILogger from '../../helpers/ILogger'

import { cli } from 'cli-ux'
import { ICreateTokenResponse } from '../../api/HttpClient'

export default class CreateToken extends CommandWithProjectConfig {
    static description = 'Creates an OAuth2 token'

    static flags = {
        ...CommandWithProjectConfig.flags,
        output: cli.table.flags().output,
        "no-header": cli.table.flags()["no-header"],
        "no-truncate": cli.table.flags()["no-truncate"]
    }

    logger?: ILogger

    async run() {
        const result = this.parse(CreateToken)

        this.args = result.args
        this.flags = result.flags

        await this.loadProjectConfig()

        this.logger = new ConsoleLogger(!this.flags.debug ? LogLevel.info : LogLevel.debug)
        this.logger.debug('--debug', true)

        // if --projects_dir has been supplied running in the context of the project
        // otherwise, running in the context of the workspaces
        const runningInProjectContext = !!this.flags[CommandWithProjectConfig.projectDirFlagName]
        const clientId = runningInProjectContext ? this.projectConfig?.credentials[0].client_id : this.globalConfig?.defaultWorkspaceClientId
        const clientSecret = runningInProjectContext ? this.projectConfig?.credentials[0].client_secret : this.globalConfig?.defaultWorkspaceClientSecret
        const scopes = runningInProjectContext ? ['phone_check'] : ['projects']

        console.log(clientId, clientId)

        this.logger.info(`Creating a token for a ${runningInProjectContext ? 'Project' : 'Workspace'} with the scopes "${scopes.join(' ')}"`)

        const apiClient = new OAuth2APIClient(
            new APIConfiguration({
                clientId: clientId,
                clientSecret: clientSecret,
                scopes: scopes,
                baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.4auth.io`
            }),
            this.logger
        )

        try {
            let tokenCreationResult = await apiClient.create()

            this.displayResults([tokenCreationResult])
        }
        catch (error) {
            this.log('API Error:',
                `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
            this.exit(1)
        }

    }

    displayResults(resources: ICreateTokenResponse[]) {

        cli.table(resources, {
            access_token: {
                header: 'access_token',
            },
            scope: {
                header: 'scope',
                extended: true
            },
            token_type: {
                header: 'token_type',
                extended: true
            },
            id_token: {
                header: 'id_token',
                extended: true
            },
            expires_in: {
                header: 'expires_in',
                extended: true
            },
            refresh_token: {
                header: 'refresh_token',
                extended: true
            }
        }, {
            printLine: (s: any) => { this.logger!.info(s) },
            ...this.flags, // parsed flags
        })
    }

}