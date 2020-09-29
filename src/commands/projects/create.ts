import {flags} from '@oclif/command'
import * as inquirer from 'inquirer'
import * as fs from 'fs-extra'

import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {ProjectsAPIClient, ICreateProjectResponse, ICreateProjectPayload} from '../../api/ProjectsAPIClient'
import {APIConfiguration} from '../../api/APIConfiguration'
import {stringToSnakeCase} from '../../utilities'
import {ConsoleLogger, LogLevel} from '../../helpers/ConsoleLogger'

import PhoneChecksCreate from '../phonechecks/create'
import * as chalk from 'chalk'
import { phoneCheckCallbackUrlFlag, phoneCheckCallbackUrlFlagValidation, projectModeFlag } from '../../helpers/ProjectFlags'

export default class Create extends CommandWithProjectConfig {
  static description = 'Creates a new Project'

  static examples = [
    `$ 4auth project:create
What is the name of the project?: My first project
Creating Project "My first project"
`,
  `$ 4auth project:create --${phoneCheckCallbackUrlFlag.flagName} https://example.com/callback`,
  `$ 4auth project:create --${projectModeFlag.flagName} sandbox`,
  `$ 4auth project:create --${projectModeFlag.flagName} live`,
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    quickstart: flags.boolean({
      description: 'Create a Project and also create a Phone Check in workflow mode.'
    }),
    ...phoneCheckCallbackUrlFlag.flag,
    ...projectModeFlag.flag
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
    logger.debug('args', this.args)
    logger.debug('flags', this.flags)

    if(this.flags[phoneCheckCallbackUrlFlag.flagName] && 
       phoneCheckCallbackUrlFlagValidation(this.flags[phoneCheckCallbackUrlFlag.flagName], logger) === false) {
      this.exit()
    }

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
          scopes: ['projects'],
          baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.4auth.io`
      }),
      logger
    )
    
    let projectCreationResult:ICreateProjectResponse;
    try {
      const createPayload: ICreateProjectPayload = {
        name: this.args.name
      }
      if(this.flags[phoneCheckCallbackUrlFlag.flagName]) {
        createPayload.configuration = {
          phone_check: {
            callback_url: this.flags[phoneCheckCallbackUrlFlag.flagName]
          }
        }
      }

      if(this.flags[projectModeFlag.flagName]) {
        createPayload.mode = this.flags[projectModeFlag.flagName]
      }

      projectCreationResult = await projectsAPI.create(createPayload)
    }
    catch(error) {
      this.log('API Error:',
              `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, 2) : '')}`)
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

        // See https://oclif.io/docs/running_programmatically
        // The approach below of using `.run` is not recommended
        if(this.flags.quickstart) {
          this.log('')
          this.log(chalk.green.visible('Ok, let\'s run your first Phone Check!'))
          this.log('')

          const phoneCheckRunParams = [`--${CommandWithProjectConfig.projectDirFlagName}`, pathToProjectDirectory, '--workflow']
          if(this.flags.debug) {
            phoneCheckRunParams.push('--debug')
          }
          await PhoneChecksCreate.run(phoneCheckRunParams)
        }
      }
      catch(error) {
        this.error(`An unexpected error occurred: ${error}`, {exit: 1})
      }
    }
  }

}