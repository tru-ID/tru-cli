import { APIConfiguration } from '../../api/APIConfiguration'
import {
  IUpdateProjectPayload,
  ProjectsAPIClient,
} from '../../api/ProjectsAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {
  phoneCheckCallbackUrlFlag,
  phoneCheckCallbackUrlFlagValidation,
  projectModeFlag,
  removePhoneCheckCallbackFlag,
} from '../../helpers/ProjectFlags'
import { logApiError } from '../../utilities'

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
  }

  static args = [
    {
      name: 'project-id',
      required: false,
      description: 'the ID of the project to update',
    },
  ]

  async run() {
    const result = await this.parse(ProjectsUpdate)
    this.args = result.args
    this.flags = result.flags

    await super.run()

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
      this.logger.error('')
      this.showCommandHelp({ exitCode: 1 })
    }

    this.log(`Updated Project with project_id "${this.args['project-id']}"`)

    const projectsAPI = new ProjectsAPIClient(
      new APIConfiguration({
        clientId: this.globalConfig?.defaultWorkspaceClientId,
        clientSecret: this.globalConfig?.defaultWorkspaceClientSecret,
        scopes: ['projects'],
        baseUrl:
          this.globalConfig?.apiBaseUrlOverride ??
          `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`,
      }),
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

      await projectsAPI.update(this.args['project-id'], updatePayload)

      this.logger.info('✅ Project updated')
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
    }
  }
}
