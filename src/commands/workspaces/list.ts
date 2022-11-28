import { CliUx } from '@oclif/core'
import { RefreshTokenManager } from '../../api/TokenManager'
import { UserInfoAPIClient } from '../../api/UserInfoAPIClient'
import {
  IWorkspaceResource,
  WorkspacesAPIClient,
} from '../../api/WorkspacesAPIClient'
import {
  apiBaseUrlDR,
  issuerUrl,
  loginBaseUrl,
  workspaceTokenUrl,
} from '../../DefaultUrls'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import { isWorkspaceTokenInfoValid } from '../../helpers/ValidationUtils'
import { logApiError } from '../../utilities'

export default class WorkspaceLists extends CommandWithGlobalConfig {
  static description = 'List of available workspaces'

  static flags = {
    ...CommandWithGlobalConfig.flags,
    output: CliUx.ux.table.flags().output,
    'no-header': CliUx.ux.table.flags()['no-header'],
    'no-truncate': CliUx.ux.table.flags()['no-truncate'],
  }

  async run(): Promise<any> {
    const result = await this.parse(WorkspaceLists)
    this.flags = result.flags

    await super.run()

    isWorkspaceTokenInfoValid(this.globalConfig!)

    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refreshToken!,
        configLocation: this.getConfigPath(),
        tokenUrl: workspaceTokenUrl(loginBaseUrl(this.globalConfig!)),
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
          apiBaseUrlDR(dataResidency, this.globalConfig!),
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
          header: 'DR',
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
}
