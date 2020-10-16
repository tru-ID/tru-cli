import {flags} from '@oclif/command'
import {ConsoleLogger, LogLevel} from '../../helpers/ConsoleLogger'
import {APIConfiguration} from '../../api/APIConfiguration'
import { PhoneChecksAPIClient, ICreatePhoneCheckResponse, PhoneCheckStatus, IPhoneCheckResource } from '../../api/PhoneChecksAPIClient'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import cli from 'cli-ux'
import * as chalk from 'chalk'
import { validate, transform } from '../../helpers/phone'

import * as qrcode from 'qrcode-terminal'

import * as inquirer from 'inquirer'
import ILogger from '../../helpers/ILogger'

export default class PhoneChecksCreate extends CommandWithProjectConfig {
  static description = 'Creates a Phone Check'

  static flags = {
    ...CommandWithProjectConfig.flags,
    'workflow': flags.boolean({
      description: 'Execute the Phone Check Workflow from the CLI',
      required: false
    }),
    'skip-qrcode-handler': flags.boolean({
      description: 'Skips using the 4Auth hosted QR code handler with the `check_url`',
      required: false,
      dependsOn: ['workflow']
    })
  }

  static args = [
    {
        name: 'phone_number',
        required: false, // caught upon running and then user is prompted
        description: 'The phone number to perform the Phone Check on'
    }
  ]

  logger?: ILogger

  async run() {
    const result = this.parse(PhoneChecksCreate)
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    // TODO: move to CommandWithGlobalConfig
    this.logger = new ConsoleLogger(!this.flags.debug? LogLevel.info : LogLevel.debug)
    this.logger.debug('--debug', true)

    if(this.args.phone_number === undefined) {
      const response = await inquirer.prompt([
        {
          name: 'phone_number',
          message: 'Please enter the phone number you would like to Phone Check',
          type: 'input',
          validate: (input) => {
            if( validate(input) ) {
              return true
            }
            return  ('The phone number needs to be in E.164 format. For example, +447700900000 or +14155550100. ' +
                     'Or a format that can be converted to E164. For example, 44 7700 900000 or 1 (415) 555-0100.')
          },
          filter: transform
        }
      ])

      this.args.phone_number = response['phone_number']
    }

    this.log(`Creating Phone Check for ${this.args.phone_number}`)

    const phoneCheckAPIClient = new PhoneChecksAPIClient(new APIConfiguration({
          clientId: this.projectConfig?.credentials[0].client_id,
          clientSecret: this.projectConfig?.credentials[0].client_secret,
          scopes: ['phone_check'],
          baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`
      }),
      this.logger
    )

    let response:ICreatePhoneCheckResponse;

    try {
      response = await phoneCheckAPIClient.create({
        phone_number: this.args.phone_number
      })
    }
    catch(error) {
      this.log('API Error:',
              `${error.toString()} ${(error.response && error.response.data? JSON.stringify(error.response.data, null, 2) : '')}`)
      this.exit(1)
    }

    if(response.status === PhoneCheckStatus.ACCEPTED) {
      this.log('Phone Check ACCEPTED')

      if(this.flags.workflow) {
        let urlForQrCode = response._links.check_url.href

        console.log(this.flags)
        if(!this.flags['skip-qrcode-handler']) {
          const handlerUrl: string = this.globalConfig?.qrCodeUrlHandlerOverride ?? `http://r.4auth.io?u={CHECK_URL}`
          urlForQrCode = handlerUrl.replace('{CHECK_URL}', `${encodeURIComponent(urlForQrCode)}`)
        }
        this.logger.debug('QR Code Link Handler:', urlForQrCode)
        qrcode.generate(urlForQrCode, {small: true})

        this.log(chalk.white.bgRed.visible(`Please ensure the mobile phone with the phone number ${this.args.phone_number} is disconnected from WiFi and is using your mobile data connection.`))
        this.log('')
        this.log('Then scan the QR code and navigate to the check_url.')
        this.log('')
        cli.action.start('Waiting for a Phone Check result')

        try {
          const checkResponse = await this.waitForFinalPhoneCheckState(phoneCheckAPIClient, response)

          cli.action.stop()

          this.log('')
          this.log(`Phone Check Workflow result:\n` +
            `\tstatus:\t${checkResponse.status}\n` +
            `\tmatch:\t${checkResponse.match} ${checkResponse.match?'✅':'❌'}`)
        }
        catch(error) {
          cli.action.stop(`The Phone Check match did not complete within ${response.ttl} seconds.`)
          this.exit(1)
        }
      }
    }
    else {
      this.log(`The Phone Check could not be created. The Phone Check status is ${response.status}`)
      this.exit(1)
    }

  }

  async waitForFinalPhoneCheckState(phoneCheckAPIClient:PhoneChecksAPIClient, phoneCheck:IPhoneCheckResource): Promise<IPhoneCheckResource> {
    const pollingInterval = this.globalConfig?.phoneCheckWorkflowRetryMillisecondsOverride ?? 5000
    return new Promise((resolve) => {

      let checkResponse:IPhoneCheckResource

      const expiry = Date.now() + (phoneCheck.ttl*1000) // seconds from now until expires
      const intervalId = setInterval(async () => {

        checkResponse = await phoneCheckAPIClient.get(phoneCheck.check_id)

        const expiresInSeconds = Math.round( (expiry - Date.now()) / 1000 )
        cli.action.status = `Phone Check expires in ${expiresInSeconds} seconds`

        if(checkResponse.status == PhoneCheckStatus.COMPLETED ||
          checkResponse.status == PhoneCheckStatus.EXPIRED ||
          checkResponse.status == PhoneCheckStatus.ERROR ||
          expiresInSeconds <= 0) {
            cli.action.stop()

            resolve(checkResponse)

            clearInterval(intervalId)
        }
      }, pollingInterval)
    })

  }

}
