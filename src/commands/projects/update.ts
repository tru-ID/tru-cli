import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import {ProjectsAPIClient, ICreateProjectResponse, ICreateProjectPayload, IUpdateProjectPayload} from '../../api/ProjectsAPIClient'
import {APIConfiguration} from '../../api/APIConfiguration'
import {ConsoleLogger, LogLevel} from '../../helpers/ConsoleLogger'

import { phoneCheckCallbackUrlFlag, phoneCheckCallbackUrlFlagValidation } from '../../helpers/ProjectFlags'

export default class Create extends CommandWithProjectConfig {
  static description = 'Update an existing Project'

  static examples = [
    `$ 4auth project:update --phonecheck-callback-url https://example.com/callback
`,
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...phoneCheckCallbackUrlFlag,
  }

  static args = [
    {
        name: 'project-id',
        required: true,
        description: 'the ID of the project to update'
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

    if(this.flags['phonecheck-callback-url'] !== undefined) {
      if(phoneCheckCallbackUrlFlagValidation(this.flags['phonecheck-callback-url'], logger) === false) {
        this.exit()
      }
    }
    else {
      logger.error('At least one flag must be supplied to indicate the update to be applied to the Project')
      this.exit()
    }

    this.log(`Updated Project with project_id "${this.args['project-id']}"`)

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
      const updatePayload: IUpdateProjectPayload = {}

      if(this.flags['phonecheck-callback-url']?.length !== undefined) {
        updatePayload.configuration = {
          phone_check: {
            callback_url: this.flags['phonecheck-callback-url']
          }
        }
      }

      projectCreationResult = await projectsAPI.update(this.args['project-id'], updatePayload)

      logger.info('✅ Project updated')
    }
    catch(error) {
      this.log('API Error:',
              `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, 2) : '')}`)
      this.exit(1)
    }
  }
}