import { CliUx } from '@oclif/core'
import { RefreshTokenManager } from '../../api/TokenManager'
import {
  IWorkspaceResource,
  WorkspacesAPIClient,
} from '../../api/WorkspacesAPIClient'
import {
  apiBaseUrlDR,
  issuerUrl,
  loginBaseUrl,
  tokenUrl,
} from '../../DefaultUrls'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import { logApiError } from '../../utilities'

export default class WorkspaceSelected extends CommandWithGlobalConfig {
  static description = 'Displays selected workspace information'

  static flags = {
    ...CommandWithGlobalConfig.flags,
    output: CliUx.ux.table.flags().output,
    'no-header': CliUx.ux.table.flags()['no-header'],
    'no-truncate': CliUx.ux.table.flags()['no-truncate'],
  }

  async run() {
    const result = await this.parse(WorkspaceSelected)
    this.flags = result.flags

    await super.run()

    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refresh_token!,
        configLocation: this.getConfigPath(),
        tokenUrl: tokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    const workspacesAPIClient = new WorkspacesAPIClient(
      tokenManager,
      apiBaseUrlDR(this.globalConfig!),
      this.logger,
    )

    let singleResource: IWorkspaceResource
    try {
      singleResource = await workspacesAPIClient.get(
        this.globalConfig!.selectedWorkspace!,
      )

      this.displayResults([singleResource])
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }

  displayResults(resources: IWorkspaceResource[]): void {
    CliUx.ux.table(
      resources,
      {
        data_residency: {
          header: 'data_residency',
        },
        workspace_id: {
          header: 'workspace_id',
        },
        name: {
          header: 'name',
        },
        'balance.amount_available': {
          header: 'balance.amount_available',
          get: (row: IWorkspaceResource) =>
            row._embedded.balance.amount_available,
        },
        'balance.currency': {
          header: 'balance.currency',
          get: (row: IWorkspaceResource) => row._embedded.balance.currency,
        },
        'me.role': {
          header: 'me.role',
          get: (row: IWorkspaceResource) => row._embedded.me.role,
        },
        created_at: {
          header: 'created_at',
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