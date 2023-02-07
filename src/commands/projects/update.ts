import {
  IProjectResource,
  IUpdateProjectPayload,
  ProjectsAPIClient,
} from '../../api/ProjectsAPIClient'
import { RefreshTokenManager } from '../../api/TokenManager'
import {
  apiBaseUrlDR,
  issuerUrl,
  loginBaseUrl,
  workspaceTokenUrl,
} from '../../DefaultUrls'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {
  phoneCheckCallbackUrlFlag,
  phoneCheckCallbackUrlFlagValidation,
  projectModeFlag,
  removePhoneCheckCallbackFlag,
} from '../../helpers/ProjectFlags'
import {
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from '../../helpers/ValidationUtils'
import { logApiError } from '../../utilities'
import { CliUx } from '@oclif/core'

export default class ProjectsUpdate extends CommandWithProjectConfig {
  static description = 'Update an existing Project'

  static examples = [
    `$ tru projects:update --phonecheck-callback https://example.com/callback`,
    `$ tru projects:update --remove-phonecheck-callback`,
    `$ tru projects:update --mode sandbox`,
    `$ tru projects:update --mode live`,
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...phoneCheckCallbackUrlFlag.flag,
    ...removePhoneCheckCallbackFlag.flag,
    ...projectModeFlag.flag,
    output: CliUx.ux.table.flags().output,
  }

  static args = [
    {
      name: 'project-id',
      required: false,
      description: 'the ID of the project to update',
    },
  ]

  async run(): Promise<void> {
    const result = await this.parse(ProjectsUpdate)
    this.args = result.args
    this.flags = result.flags

    await super.run()

    isWorkspaceTokenInfoValid(this.globalConfig!)
    isWorkspaceSelected(this.globalConfig!)

    this.logger.debug('args', this.args)
    this.logger.debug('flags', this.flags)

    if (!this.args['project-id']) {
      await this.loadProjectConfig()

      this.args['project-id'] = this.projectConfig!.project_id
    }

    if (this.flags[phoneCheckCallbackUrlFlag.flagName] !== undefined) {
      if (
        phoneCheckCallbackUrlFlagValidation(
          this.flags[phoneCheckCallbackUrlFlag.flagName],
          this.logger,
        ) === false
      ) {
        this.exit(1)
      }
    } else if (
      this.flags[removePhoneCheckCallbackFlag.flagName] === false &&
      this.flags[projectModeFlag.flagName] === undefined
    ) {
      this.logger.error(
        'At least one flag must be supplied to indicate the update to be applied to the Project',
      )
      this.exit(1)
    }

    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refreshToken,
        configLocation: this.getConfigPath(),
        tokenUrl: workspaceTokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    const projectsAPIClient = new ProjectsAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.globalConfig!.selectedWorkspaceDataResidency!,
        this.globalConfig!,
      ),
      this.logger,
    )

    try {
      const updatePayload: IUpdateProjectPayload = {}

      if (this.flags[phoneCheckCallbackUrlFlag.flagName]) {
        updatePayload.configuration = {
          phone_check: {
            callback_url: this.flags[phoneCheckCallbackUrlFlag.flagName],
          },
        }
      }
      if (this.flags[removePhoneCheckCallbackFlag.flagName]) {
        updatePayload.configuration = {
          phone_check: {},
        }
      }
      if (this.flags[projectModeFlag.flagName]) {
        updatePayload.mode = this.flags[projectModeFlag.flagName]
      }

      const updatedProject = await projectsAPIClient.update(
        this.globalConfig!.selectedWorkspace!,
        this.args['project-id'],
        updatePayload,
      )

      this.printResponse(updatedProject)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }

  printDefault(response: IProjectResource): void {
    if (!this.flags.output) {
      this.logger.info('✅ Project updated')
      return
    }

    CliUx.ux.table(
      [response],
      {
        project_id: { header: 'project_id' },
        name: { header: 'name' },
        mode: { header: 'mode' },
        disabled: { header: 'disabled' },
        created_at: { header: 'created_at' },
        updated_at: { header: 'updated_at' },
        phonecheck_callback_url: {
          header: 'configuration.phone_check.callback_url',
          get: (row: IProjectResource) =>
            row.configuration?.phone_check?.callback_url,
        },
      },
      { ...this.flags },
    )
  }
}
