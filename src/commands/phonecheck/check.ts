import {Command, flags} from '@oclif/command'
import {ConsoleLogger, LogLevel} from '../../helpers/ConsoleLogger'
import {APIConfiguration} from '../../api/APIConfiguration'
import { PhoneCheckAPIClient, ICreatePhoneCheckResponse, PhoneCheckStatus } from '../../api/PhoneCheckAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'

import * as inquirer from 'inquirer'

export default class PhoneCheckTest extends CommandWithProjectConfig {
  static description = 'describe the command here'

  static flags = {
    ...CommandWithProjectConfig.flags,
  }

  static args = [
    {
        name: 'phone_number',
        required: false, // caught upon running and then user is prompted
        description: 'The phone number to perform the Phone Check on'
    }
  ]

  async run() {
    const result = this.parse(PhoneCheckTest)
    this.args = result.args
    this.flags = result.flags
    await this.loadConfig()

    // TODO: move to CommandWithGlobalConfig
    const logger = new ConsoleLogger(!this.flags.debug? LogLevel.info : LogLevel.debug)
    logger.debug('--debug', true)

    if(this.args.phone_number === undefined) {
      const response = await inquirer.prompt([
        {
          name: 'phone_number',
          message: 'Please enter the phone number you would like to Phone Check',
          type: 'input'
        }
      ])

      this.args.phone_number = response['phone_number']
    }

    this.log(`Testing Phone Check for ${this.args.phone_number}`)

    const phoneCheckAPIClient = new PhoneCheckAPIClient(new APIConfiguration({
          clientId: this.globalConfig?.defaultWorkspaceClientId,
          clientSecret: this.globalConfig?.defaultWorkspaceClientSecret,
          baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.4auth.io`
      }),
      logger
    )

    let response:ICreatePhoneCheckResponse;
    
    try {
      response = await phoneCheckAPIClient.create({
        phone_number: this.args.phone_number
      })
    }
    catch(error) {
      this.log('API Error - There was an error with the 4Auth API',
              `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, '\t') : '')}`)
      this.exit(1)
    }

    if(response.status === PhoneCheckStatus.ACCEPTED) {
      this.log('Phone Check ACCEPTED')
      this.log(JSON.stringify(response, null, 2))
    }
    else {
      this.log(`The Phone Check could not be created. The Phone Check status is ${response.status}`)
      this.exit(1)
    }

  }

}
