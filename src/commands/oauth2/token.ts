import { CliUx } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  AccessToken,
  ClientCredentialsManager,
  RefreshTokenManager,
} from '../../api/TokenManager'
import { tokenUrlDR } from '../../DefaultUrls'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {
  doesProjectConfigExist,
  isProjectCredentialsValid,
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

    await this.loadProjectConfig()

    doesProjectConfigExist(this.projectConfig)
    isProjectCredentialsValid(this.projectConfig!)

    if (!this.projectConfig?.data_residency) {
      this.warn(
        'No data_residency specified in project config tru.json. It will default to eu',
      )
    }

    const configClientCredentials: APIClientCredentialsConfiguration = {
      clientId: this.projectConfig!.credentials[0].client_id!,
      clientSecret: this.projectConfig!.credentials[0].client_secret!,
      scopes: this.projectConfig!.credentials[0].scopes!,
      tokenUrl: tokenUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
    }

    const clientCredentialsManager = new ClientCredentialsManager(
      configClientCredentials,
      this.logger,
    )

    const accessToken: AccessToken =
      await clientCredentialsManager.getAccessToken()

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

  getScopes(projectConfig?: IProjectConfiguration): string[] {
    const scopes = projectConfig?.credentials[0].scopes ?? ['phone_check']

    return scopes
  }
}
