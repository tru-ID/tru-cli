import { CliUx } from '@oclif/core'
import fs from 'fs-extra'
import { RefreshTokenManager } from '../../api/TokenManager'
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
import { IGlobalAuthConfiguration } from '../../IGlobalAuthConfiguration'
import { logApiError } from '../../utilities'

export default class WorkspaceSwitch extends CommandWithGlobalConfig {
  static description = 'Switch workspaces'

  static flags = {
    ...CommandWithGlobalConfig.flags,
    output: CliUx.ux.table.flags().output,
    'no-header': CliUx.ux.table.flags()['no-header'],
    'no-truncate': CliUx.ux.table.flags()['no-truncate'],
  }

  static args = [
    {
      name: 'data_residency',
      required: true,
      description: 'data residency where the workspace is located',
    },
    {
      name: 'workspace_id',
      required: true,
      description: 'selected Workspace',
    },
  ]

  async run(): Promise<void> {
    const result = await this.parse(WorkspaceSwitch)
    this.flags = result.flags
    this.args = result.args

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

    const workspacesAPIClient = new WorkspacesAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.args['data_residency'].toLowerCase(),
        this.globalConfig!,
      ),
      this.logger,
    )

    try {
      const workspace = await workspacesAPIClient.get(this.args['workspace_id'])

      await this.updateGlobalConfig(workspace)

      this.printResponse(workspace)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }

  printDefault(resources: IWorkspaceResource): void {
    CliUx.ux.table(
      [resources],
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

  async updateGlobalConfig(workspace: IWorkspaceResource): Promise<void> {
    await this.loadGlobalConfig(this.getConfigPath())

    this.globalConfig!.selectedWorkspaceDataResidency =
      workspace.data_residency.toLocaleLowerCase()
    this.globalConfig!.selectedWorkspace = workspace.workspace_id

    await this.saveConfig(this.getConfigPath(), this.globalConfig!)
  }

  async saveConfig(
    configLocation: string,
    config: IGlobalAuthConfiguration,
  ): Promise<void> {
    await fs.outputJson(configLocation, config, { spaces: 2 })
  }
}
