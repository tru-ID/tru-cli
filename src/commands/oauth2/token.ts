import { CliUx } from '@oclif/core'
import {
  APIClientCredentialsConfiguration,
  APIRefreshTokenConfiguration,
} from '../../api/APIConfiguration'
import {
  AccessToken,
  ClientCredentialsManager,
  RefreshTokenManager,
} from '../../api/TokenManager'
import {
  issuerUrl,
  loginBaseUrl,
  tokenUrl,
  tokenUrlDR,
} from '../../DefaultUrls'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {
  doesProjectConfigExist,
  isProjectCredentialsValid,
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from '../../helpers/ValidationUtils'
import { IProjectConfiguration } from '../../IProjectConfiguration'

export default class CreateToken extends CommandWithProjectConfig {
  static description = 'Creates an OAuth2 token'

  static flags = {
    ...CommandWithProjectConfig.flags,
    output: CliUx.ux.table.flags().output,
    extended: CliUx.ux.table.flags().extended,
    'no-header': CliUx.ux.table.flags()['no-header'],
    'no-truncate': CliUx.ux.table.flags()['no-truncate'],
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
Emesua0F7gj3qOaav7UaKaBwefaaefaAxlrdGom_mb3U.78Od2d9XpvTQbd44eM1Uf7nzz9e9nezs5TRjPmpDnMc`,
  ]

  refreshTokenManager: RefreshTokenManager | undefined
  clientCredentialsManager: ClientCredentialsManager | undefined

  async run() {
    const result = await this.parse(CreateToken)

    this.args = result.args
    this.flags = result.flags

    // if --projects_dir has been supplied running in the context of the project
    // otherwise, running in the context of the workspaces
    const runningInProjectContext =
      !!this.flags[CommandWithProjectConfig.projectDirFlagName]

    let accessToken: AccessToken

    this.logger.debug(
      `Creating a token for a ${
        runningInProjectContext ? 'Project' : 'Workspace'
      } "`,
    )

    if (runningInProjectContext) {
      await this.loadProjectConfig()

      isWorkspaceSelected(this.globalConfig!)
      doesProjectConfigExist(this.projectConfig)
      isProjectCredentialsValid(this.projectConfig!)

      const configClientCredentials: APIClientCredentialsConfiguration = {
        clientId: this.projectConfig!.credentials[0].client_id!,
        clientSecret: this.projectConfig!.credentials[0].client_secret!,
        scopes: this.projectConfig!.credentials[0].scopes!,
        tokenUrl: tokenUrlDR(this.globalConfig!),
      }

      const clientCredentialsManager = new ClientCredentialsManager(
        configClientCredentials,
        this.logger,
      )

      accessToken = await clientCredentialsManager.getAccessToken()
    } else {
      isWorkspaceTokenInfoValid(this.globalConfig!)
      isWorkspaceSelected(this.globalConfig!)

      const configRefreshToken: APIRefreshTokenConfiguration = {
        refreshToken: this.globalConfig!.tokenInfo!.refresh_token,
        configLocation: this.getConfigPath(),
        tokenUrl: tokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      }

      const refreshTokenManager = new RefreshTokenManager(
        configRefreshToken,
        this.logger,
      )

      accessToken = await refreshTokenManager.getAccessToken()
    }

    this.displayResults([accessToken])
  }

  displayResults(resources: AccessToken[]) {
    CliUx.ux.table(
      resources,
      {
        access_token: {
          header: 'access_token',
        },
        scope: {
          header: 'scope',
          extended: true,
        },
        token_type: {
          header: 'token_type',
          extended: true,
        },
        expires_in: {
          header: 'expires_in',
          extended: true,
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

  getScopes(
    runningInProjectContext: boolean,
    projectConfig?: IProjectConfiguration,
  ): string[] {
    let scopes: string[]

    if (runningInProjectContext) {
      // Defaulting to phone_check since that was the initial scope defined and just to keep compatible with old project config
      // that do not have the scopes in tru.json of project directory.
      scopes = projectConfig?.credentials[0].scopes ?? ['phone_check']
    } else {
      // In Workspace. Set Workspaces scopes
      scopes = ['workspaces', 'projects', 'usage', 'balances']
    }

    return scopes
  }
}
