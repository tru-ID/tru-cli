import {flags} from '@oclif/command'
import * as inquirer from 'inquirer'
import * as fs from 'fs-extra'

import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {ProjectsAPIClient, ICreateProjectResponse} from '../../api/ProjectsAPIClient'
import {APIConfiguration} from '../../api/APIConfiguration'
import {stringToSnakeCase} from '../../utilities'
import {ConsoleLogger, LogLevel} from '../../helpers/ConsoleLogger'

export default class Create extends CommandWithProjectConfig {
  static description = 'Creates a new Project'

  static examples = [
    `$ 4auth project:create
What is the name of the project?: My first project
Creating Project "My first project"
`,
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
  }

  static args = [
    {
        name: 'name',
        required: false, // caught upon running and then user is prompted
        description: 'the name of the project to create'
    }
  ]

  async run() {
    const result = this.parse(Create)
    this.args = result.args
    this.flags = result.flags

    const logger = new ConsoleLogger(!this.flags.debug? LogLevel.info : LogLevel.debug)
    logger.debug('--debug', true)

    if(!this.args.name) {
        const response:any = await inquirer.prompt([
          {
            name: 'projectName',
            message: 'What is the name of the project?',
            type: 'input'
          }
        ])
        this.args.name = response['projectName']
    }
    this.log(`Creating Project "${this.args.name}"`)

    const projectsAPI = new ProjectsAPIClient(
      new APIConfiguration({
          clientId: this.globalConfig?.defaultWorkspaceClientId,
          clientSecret: this.globalConfig?.defaultWorkspaceClientSecret,
          baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.4auth.io`
      }),
      logger
    )
    
    let projectCreationResult:ICreateProjectResponse;
    try {
      projectCreationResult = await projectsAPI.create({
        name: this.args.name
      })
    }
    catch(error) {
      this.log('API Error - There was an error with the 4Auth API',
              `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, '\t') : '')}`)
      this.exit(1)
    }

    const pathToProjectDirectory = this.flags[CommandWithProjectConfig.projectDirFlagName] ?? `${process.cwd()}/${stringToSnakeCase(this.args.name)}`
    const configFileFullPathToCreate = `${pathToProjectDirectory}/4auth.json`
    if(fs.existsSync(configFileFullPathToCreate)) {
        this.error(`Cannot create project. A Project configuration file (4auth.json) already exists at "${configFileFullPathToCreate}".\n` +
                   `Please choose another name or specify an alternative directory for your project.`, {exit: 1})
    }
    else {
      try {
        // Save the project configuration to match the Project resource excluding the _links property
        const projectConfig = {
          ...projectCreationResult
        }
        delete projectConfig._links
        await fs.outputJson(configFileFullPathToCreate, projectConfig, {spaces: '\t'})

        this.log(`Project configuration saved to "${configFileFullPathToCreate}".`)
      }
      catch(error) {
        this.error(`An unexpected error occurred: ${error}`, {exit: 1})
      }
    }
  }

}