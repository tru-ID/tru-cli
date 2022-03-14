import { CliUx } from '@oclif/core'
import { RefreshTokenManager } from '../../api/TokenManager'
import { UserInfoAPIClient } from '../../api/UserInfoAPIClient'
import {
  IWorkspaceResource,
  WorkspacesAPIClient,
} from '../../api/WorkspacesAPIClient'
import {
  apiBaseUrlDRString,
  issuerUrl,
  loginBaseUrl,
  tokenUrl,
} from '../../DefaultUrls'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import { logApiError } from '../../utilities'

export default class WorkspaceLists extends CommandWithGlobalConfig {
  static description = 'List of available workspaces'

  static flags = {
    ...CommandWithGlobalConfig.flags,
    output: CliUx.ux.table.flags().output,
    'no-header': CliUx.ux.table.flags()['no-header'],
    'no-truncate': CliUx.ux.table.flags()['no-truncate'],
  }

  async run() {
    const result = await this.parse(WorkspaceLists)
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

    /**
     * loginBaseUrl: string, tokenManager: RefreshTokenManager
     */
    const userinfoClient = new UserInfoAPIClient(
      loginBaseUrl(this.globalConfig!),
      tokenManager,
    )

    try {
      const userInfo = await userinfoClient.post()

      let workspaces: IWorkspaceResource[] = new Array<IWorkspaceResource>()

      for (const dataResidency of userInfo.workspace_membership_in) {
        const workspacesAPIClient = new WorkspacesAPIClient(
          tokenManager,
          apiBaseUrlDRString(dataResidency),
          this.logger,
        )

        const workspaceList = await workspacesAPIClient.getAll()

        workspaces = workspaces.concat(workspaceList._embedded.workspaces)
      }

      this.displayResults(workspaces)
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
