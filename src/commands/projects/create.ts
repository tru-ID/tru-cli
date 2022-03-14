import { CliUx } from '@oclif/core'
import fs from 'fs-extra'
import {
  ICreateProjectPayload,
  IProjectCreateResource,
  ProjectsAPIClient,
} from '../../api/ProjectsAPIClient'
import { RefreshTokenManager } from '../../api/TokenManager'
import {
  apiBaseUrlDR,
  issuerUrl,
  loginBaseUrl,
  tokenUrl,
} from '../../DefaultUrls'
import CommandWithGlobalConfig from '../../helpers/CommandWithGlobalConfig'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {
  phoneCheckCallbackUrlFlag,
  phoneCheckCallbackUrlFlagValidation,
  projectModeFlag,
} from '../../helpers/ProjectFlags'
import {
  isWorkspaceSelected,
  isWorkspaceTokenInfoValid,
} from '../../helpers/ValidationUtils'
import { IProjectConfiguration } from '../../IProjectConfiguration'
import { logApiError, stringToSnakeCase } from '../../utilities'

export default class ProjectsCreate extends CommandWithGlobalConfig {
  static description = 'Creates a new Project'

  static examples = [
    `$ tru projects:create
What is the name of the project?: My first project
Creating Project "My first project"
`,
    `$ tru projects:create --${phoneCheckCallbackUrlFlag.flagName} https://example.com/callback`,
    `$ tru projects:create --${projectModeFlag.flagName} sandbox`,
    `$ tru projects:create --${projectModeFlag.flagName} live`,
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...phoneCheckCallbackUrlFlag.flag,
    ...projectModeFlag.flag,
  }

  static args = [
    {
      name: 'name',
      required: false, // caught upon running and then user is prompted
      description: 'the name of the project to create',
    },
  ]

  async run() {
    const result = await this.parse(ProjectsCreate)
    this.args = result.args
    this.flags = result.flags

    await super.run()

    isWorkspaceTokenInfoValid(this.globalConfig!)
    isWorkspaceSelected(this.globalConfig!)

    if (
      this.flags[phoneCheckCallbackUrlFlag.flagName] &&
      phoneCheckCallbackUrlFlagValidation(
        this.flags[phoneCheckCallbackUrlFlag.flagName],
        this.logger,
      ) === false
    ) {
      this.exit()
    }

    if (!this.args.name) {
      const projectName = await CliUx.ux.prompt(
        'What is the name of the project?',
      )
      this.args.name = projectName
    }
    this.log(`Creating Project "${this.args.name}"`)

    const tokenManager = new RefreshTokenManager(
      {
        refreshToken: this.globalConfig!.tokenInfo!.refresh_token,
        configLocation: this.getConfigPath(),
        tokenUrl: tokenUrl(loginBaseUrl(this.globalConfig!)),
        issuerUrl: issuerUrl(this.globalConfig!),
      },
      this.logger,
    )

    const projectsAPI = new ProjectsAPIClient(
      tokenManager,
      apiBaseUrlDR(this.globalConfig!),
      this.logger,
    )

    let projectCreationResult: IProjectCreateResource
    try {
      const createPayload: ICreateProjectPayload = {
        name: this.args.name,
      }
      if (this.flags[phoneCheckCallbackUrlFlag.flagName]) {
        createPayload.configuration = {
          phone_check: {
            callback_url: this.flags[phoneCheckCallbackUrlFlag.flagName],
          },
        }
      }

      if (this.flags[projectModeFlag.flagName]) {
        createPayload.mode = this.flags[projectModeFlag.flagName]
      }
      1
      projectCreationResult = await projectsAPI.create(
        this.globalConfig!.selectedWorkspace!,
        createPayload,
      )
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
      return
    }

    const pathToProjectDirectory =
      this.flags[CommandWithProjectConfig.projectDirFlagName] ??
      `${process.cwd()}/${stringToSnakeCase(this.args.name)}`
    const configFileFullPathToCreate = `${pathToProjectDirectory}/tru.json`
    if (fs.existsSync(configFileFullPathToCreate)) {
      this.error(
        `Cannot create project. A Project configuration file (tru.json) already exists at "${configFileFullPathToCreate}".\n` +
          `Please choose another name or specify an alternative directory for your project.`,
        { exit: 1 },
      )
    } else {
      try {
        // Save the project configuration to match the Project resource excluding the _links property
        const projectConfig: IProjectConfiguration = {
          project_id: projectCreationResult.project_id,
          name: projectCreationResult.name,
          created_at: projectCreationResult.created_at,
          credentials: [
            {
              client_id:
                projectCreationResult._embedded.credentials[0].client_id,
              client_secret:
                projectCreationResult._embedded.credentials[0].client_secret!,
              scopes: projectCreationResult._embedded.credentials[0].scopes,
            },
          ],
        }
        // TODO find a better way to do this
        // eslint-disable-next-line
        // @ts-ignore
        await fs.outputJson(configFileFullPathToCreate, projectConfig, {
          spaces: '\t',
        })

        this.log(
          `Project configuration saved to "${configFileFullPathToCreate}".`,
        )
      } catch (error) {
        this.error(`An unexpected error occurred: ${error}`, { exit: 1 })
      }
    }
  }
}
