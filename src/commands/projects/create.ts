import fs from 'fs-extra'
import inquirer from 'inquirer'
import { APIConfiguration } from '../../api/APIConfiguration'
import {
  ICreateProjectPayload,
  IProjectResource,
  ProjectsAPIClient,
} from '../../api/ProjectsAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {
  phoneCheckCallbackUrlFlag,
  phoneCheckCallbackUrlFlagValidation,
  projectModeFlag,
} from '../../helpers/ProjectFlags'
import { logApiError, stringToSnakeCase } from '../../utilities'

export default class ProjectsCreate extends CommandWithProjectConfig {
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
      const response: any = await inquirer.prompt([
        {
          name: 'projectName',
          message: 'What is the name of the project?',
          type: 'input',
        },
      ])
      this.args.name = response['projectName']
    }
    this.log(`Creating Project "${this.args.name}"`)

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

    let projectCreationResult: IProjectResource
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

      projectCreationResult = await projectsAPI.create(createPayload)
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
        const projectConfig = { ...projectCreationResult }
        // TODO find a better way to do this
        // eslint-disable-next-line
        // @ts-ignore
        delete projectConfig._links
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
