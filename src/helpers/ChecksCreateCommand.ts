import * as Config from '@oclif/config'
import { flags } from '@oclif/command'
import { ConsoleLogger, LogLevel } from '../helpers/ConsoleLogger'
import { APIConfiguration } from '../api/APIConfiguration'
import CommandWithProjectConfig from '../helpers/CommandWithProjectConfig'
import cli from 'cli-ux'
import * as chalk from 'chalk'
import { promptForNumber } from '../helpers/phone'
import * as qrcode from 'qrcode-terminal'
import ILogger from '../helpers/ILogger'
import { OAuth2APIClient } from '../api/OAuth2APIClient'
import { AbstractChecksApiClient, CheckResource, ICreateCheckResponse } from '../api/ChecksAPIClient'
import { CheckStatus } from '../api/CheckStatus';

const QR_CODE_LINK_HANDLER_URL = `https://r.tru.id?u={CHECK_URL}&c={CHECK_ID}&t={ACCESS_TOKEN}`

export default abstract class ChecksCreateCommand extends CommandWithProjectConfig {

  static args = [
    {
      name: 'phone_number',
      required: false, // caught upon running and then user is prompted
      description: 'The phone number to perform the Check on'
    }
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    'workflow': flags.boolean({
      description: 'Execute the Check Workflow from the CLI',
      required: false
    }),
    'skip-qrcode-handler': flags.boolean({
      description: 'Skips using the tru hosted QR code handler with the `check_url`',
      required: false,
      dependsOn: ['workflow']
    })
  }

  typeOfCheck: string

  tokenScope: string

  constructor(typeOfCheck: string, tokenScope: string, argv: string[], config: Config.IConfig) {
    super(argv, config);
    this.typeOfCheck = typeOfCheck;
    this.tokenScope = tokenScope;
  }

  abstract parseCommand(): any;

  abstract getApiClient(apiConfiguration: APIConfiguration, logger: ILogger): AbstractChecksApiClient<CheckResource>;

  abstract getPolling(): number;

  async run() {

    const result = this.parseCommand();
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    await super.run();  

    if (this.args.phone_number === undefined) {
      const response = await promptForNumber(this.typeOfCheck)

      this.args.phone_number = response['phone_number']
    }

    this.log(`Creating ${this.typeOfCheck} for ${this.args.phone_number}`)

    let apiConfiguration = new APIConfiguration({
      clientId: this.projectConfig?.credentials[0].client_id,
      clientSecret: this.projectConfig?.credentials[0].client_secret,
      scopes: [this.tokenScope],
      baseUrl: this.globalConfig?.apiBaseUrlOverride ?? `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`
    })

    let checkApiClient = this.getApiClient(apiConfiguration, this.logger)

    let response: ICreateCheckResponse;

    try {
      response = await checkApiClient.create({
        phone_number: this.args.phone_number
      })
    }
    catch (error) {
      this.log('API Error:',
        `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
      this.exit(1)
    }

    if (response.status !== CheckStatus.ACCEPTED) {
      this.log(`The ${this.typeOfCheck} could not be created. The ${this.typeOfCheck} status is ${response.status}`)
      this.exit(1)
    }
    else {
      this.log(`${this.typeOfCheck} ACCEPTED`)
      this.log(`check_id: ${response.check_id}`)
      this.log(`check_url: ${response._links.check_url.href}`)

      if (this.flags.workflow) {
        const oAuth2APIClient = new OAuth2APIClient(apiConfiguration, this.logger)
        let accessTokenResponse
        try {
          accessTokenResponse = await oAuth2APIClient.create()
        }
        catch (error) {
          this.log('API Error:',
            `${error.toString()} ${(error.response && error.response.data ? JSON.stringify(error.response.data, null, 2) : '')}`)
          this.exit(1)
        }

        let urlForQrCode = response._links.check_url.href

        if (!this.flags['skip-qrcode-handler']) {
          const handlerUrl: string = this.globalConfig?.qrCodeUrlHandlerOverride ?? QR_CODE_LINK_HANDLER_URL
          urlForQrCode = handlerUrl
            .replace('{CHECK_URL}', `${encodeURIComponent(urlForQrCode)}`)
            .replace('{CHECK_ID}', response.check_id)
            .replace('{ACCESS_TOKEN}', accessTokenResponse.access_token)
          if (this.flags.debug) {
            urlForQrCode += `&debug=true`
          }
        }

        this.logger.debug('QR Code Link Handler:', urlForQrCode)
        qrcode.generate(urlForQrCode, { small: true })

        this.log(chalk.white.bgRed.visible(`Please ensure the mobile phone with the phone number ${this.args.phone_number} is disconnected from WiFi and is using your mobile data connection.`))
        this.log('')
        this.log('Then scan the QR code and navigate to the check_url.')
        this.log('')
        cli.action.start(`Waiting for a ${this.typeOfCheck} result`)

        try {
          const checkResponse = await this.waitForFinalCheckState(checkApiClient, response)

          cli.action.stop()

          this.logResult(checkResponse)
        }
        catch (error) {
          cli.action.stop(`The ${this.typeOfCheck} resulted in an error.`)
          this.logger.error(error)
          this.exit(1)
        }
      }
    }

  }

  abstract logResult(checkResponse: CheckResource): any

  static isFinalCheckStatus(checkStatus:CheckStatus): boolean {
    return (checkStatus == CheckStatus.COMPLETED ||
            checkStatus == CheckStatus.EXPIRED ||
            checkStatus == CheckStatus.ERROR)
  }

  async waitForFinalCheckState(checkApiClient: AbstractChecksApiClient<CheckResource>, createCheckResponse: ICreateCheckResponse): Promise<CheckResource> {
    return new Promise((resolve, reject) => {
      const pollingInterval = this.getPolling()
      const expiry = Date.now() + (createCheckResponse.ttl * 1000) // seconds from now until expires

      const checkIteraction = async () => {
        try {
          const checkResponse = await checkApiClient.get(createCheckResponse.check_id)

          const expiresInSeconds = Math.round((expiry - Date.now()) / 1000)
          cli.action.status = `${this.typeOfCheck} expires in ${expiresInSeconds} seconds`

          if (ChecksCreateCommand.isFinalCheckStatus(checkResponse.status) || expiresInSeconds <= 0) {
            resolve(checkResponse)
          }
          else {
            // A previous version used `setInterval` which meant that an additional check
            // would trigger even if the previous one had not completed. Only trigger a setTimeout
            // once the previous check has completed.
            setTimeout(checkIteraction, pollingInterval)
          }
        }
        catch(error) {
          reject(error)
        }
      }

      // start first check
      checkIteraction()

    })

  }

}


