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

    static examples = [
        `# use workspace credentials to create token
$ tru oauth2:token
`,
        `# use project credentials to create token
$ tru oauth2:token --${CommandWithProjectConfig.projectDirFlagName} path/to/project
`,
`# assign a token to a variable in shell
$ TOKEN=$(tru oauth2:token --${CommandWithProjectConfig.projectDirFlagName} path/to/project --no-header)
$ echo $TOKEN
Emesua0F7gj3qOaav7UaKaBwefaaefaAxlrdGom_mb3U.78Od2d9XpvTQbd44eM1Uf7nzz9e9nezs5TRjPmpDnMc`
    ]

    logger?: ILogger

    async run() {
        const result = this.parse(CreateToken)

        this.args = result.args
        this.flags = result.flags

        this.logger = new ConsoleLogger(!this.flags.debug ? LogLevel.info : LogLevel.debug)
        this.logger.debug('--debug', true)

        // if --projects_dir has been supplied running in the context of the project
        // otherwise, running in the context of the workspaces
        const runningInProjectContext = !!this.flags[CommandWithProjectConfig.projectDirFlagName]

        if(runningInProjectContext) {
            await this.loadProjectConfig()
        }

        const clientId = runningInProjectContext ? this.projectConfig?.credentials[0].client_id : this.globalConfig?.defaultWorkspaceClientId
        const clientSecret = runningInProjectContext ? this.projectConfig?.credentials[0].client_secret : this.globalConfig?.defaultWorkspaceClientSecret
        const scopes = runningInProjectContext ? ['phone_check'] : ['projects']

        this.logger.debug(`Creating a token for a ${runningInProjectContext ? 'Project' : 'Workspace'} with the scope "${scopes.join(' ')}"`)

        const apiClient = new OAuth2APIClient(
            new APIConfiguration({
                clientId: clientId,
                clientSecret: clientSecret,
                scopes: scopes,
                baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`
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
