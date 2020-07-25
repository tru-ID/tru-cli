import {ConsoleLogger, LogLevel} from '../../helpers/ConsoleLogger'
import {APIConfiguration} from '../../api/APIConfiguration'
import { PhoneChecksAPIClient, ICreatePhoneCheckResponse, PhoneCheckStatus, IPhoneCheckResource, IListPhoneCheckResponse } from '../../api/PhoneChecksAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'

import * as inquirer from 'inquirer'

export default class PhoneChecksList extends CommandWithProjectConfig {
  static description = 'Lists details for all Phone Checks or a specific Phone Check if the a check-id argument is passed'

  static flags = {
    ...CommandWithProjectConfig.flags,
  }

  static args = [
    {
        name: 'check_id',
        required: false, // for now, only support listing a single Phone Check
        description: 'The check_id for the Phone Check to list'
    }
  ]

  async run() {
    const result = this.parse(PhoneChecksList)
    this.args = result.args
    this.flags = result.flags
    await this.loadConfig()

    // TODO: move to CommandWithGlobalConfig
    const logger = new ConsoleLogger(!this.flags.debug? LogLevel.info : LogLevel.debug)
    logger.debug('--debug', true)

    const phoneCheckAPIClient = new PhoneChecksAPIClient(new APIConfiguration({
          clientId: this.projectConfig?.credentials[0].client_id,
          clientSecret: this.projectConfig?.credentials[0].client_secret,
          scopes: ['phone_check'],
          baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.4auth.io`
      }),
      logger
    )

    if(this.args.check_id) {
      let singleResource:IPhoneCheckResource
      try {
        singleResource = await phoneCheckAPIClient.get(this.args.check_id)

        this.log(JSON.stringify(singleResource, null, 2))
      }
      catch(error) {
        this.log('API Error - There was an error with the 4Auth API',
          `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, 2) : '')}`)
        this.exit(1)
      }
    }
    else {
      let listResource:IListPhoneCheckResponse
      try {
        listResource = await phoneCheckAPIClient.list()

        this.log(JSON.stringify(listResource, null, 2))
      }
      catch(error) {
        this.log('API Error - There was an error with the 4Auth API',
          `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, 2) : '')}`)
        this.exit(1)
      }
    }
  }
}
