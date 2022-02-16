import { CliUx, Config } from '@oclif/core'
import { APIConfiguration } from '../api/APIConfiguration'
import {
  AbstractChecksApiClient,
  CheckResource,
  ICreateCheckResponse,
} from '../api/ChecksAPIClient'
import { CheckStatus } from '../api/CheckStatus'
import CommandWithProjectConfig from '../helpers/CommandWithProjectConfig'
import ILogger from '../helpers/ILogger'
import { promptForNumber } from '../helpers/phone'
import { logApiError } from '../utilities'

// TODO this command has to be rebuilt from scratch

export default abstract class ChecksCreateCommand extends CommandWithProjectConfig {
  static args = [
    {
      name: 'phone_number',
      required: false, // caught upon running and then user is prompted
      description: 'The phone number to perform the Check on',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
  }

  typeOfCheck: string

  tokenScope: string

  constructor(
    typeOfCheck: string,
    tokenScope: string,
    argv: string[],
    config: Config,
  ) {
    super(argv, config)
    this.typeOfCheck = typeOfCheck
    this.tokenScope = tokenScope
  }

  abstract parseCommand(): any

  abstract getApiClient(
    apiConfiguration: APIConfiguration,
    logger: ILogger,
  ): AbstractChecksApiClient<CheckResource>

  abstract getPolling(): number

  async run() {
    const result = await this.parseCommand()
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    await super.run()

    if (this.args.phone_number === undefined) {
      const response = await promptForNumber(this.typeOfCheck)

      this.args.phone_number = response.phone_number
    }

    this.log(`Creating ${this.typeOfCheck} for ${this.args.phone_number}`)

    const apiConfiguration = new APIConfiguration({
      clientId: this.projectConfig?.credentials[0].client_id,
      clientSecret: this.projectConfig?.credentials[0].client_secret,
      scopes: [this.tokenScope],
      baseUrl:
        this.globalConfig?.apiBaseUrlOverride ??
        `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`,
    })

    const checkApiClient = this.getApiClient(apiConfiguration, this.logger)

    let response: ICreateCheckResponse

    try {
      response = await checkApiClient.create({
        phone_number: this.args.phone_number,
      })
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
      return
    }

    if (response.status !== CheckStatus.ACCEPTED) {
      this.log(
        `The ${this.typeOfCheck} could not be created. The ${this.typeOfCheck} status is ${response.status}`,
      )
      this.exit(1)
    } else {
      this.log(`${this.typeOfCheck} ACCEPTED`)
      this.log(`check_id: ${response.check_id}`)
      this.log(`check_url: ${response._links.check_url.href}`)
    }
  }

  abstract logResult(checkResponse: CheckResource): any

  static isFinalCheckStatus(checkStatus: CheckStatus): boolean {
    return (
      checkStatus === CheckStatus.COMPLETED ||
      checkStatus === CheckStatus.EXPIRED ||
      checkStatus === CheckStatus.ERROR
    )
  }

  async waitForFinalCheckState(
    checkApiClient: AbstractChecksApiClient<CheckResource>,
    createCheckResponse: ICreateCheckResponse,
  ): Promise<CheckResource> {
    return new Promise((resolve, reject) => {
      const pollingInterval = this.getPolling()
      const expiry = Date.now() + createCheckResponse.ttl * 1000 // seconds from now until expires

      const checkIteraction = async () => {
        try {
          const checkResponse = await checkApiClient.get(
            createCheckResponse.check_id,
          )

          const expiresInSeconds = Math.round((expiry - Date.now()) / 1000)
          CliUx.ux.action.status = `${this.typeOfCheck} expires in ${expiresInSeconds} seconds`

          if (
            ChecksCreateCommand.isFinalCheckStatus(checkResponse.status) ||
            expiresInSeconds <= 0
          ) {
            resolve(checkResponse)
          } else {
            // A previous version used `setInterval` which meant that an additional check
            // would trigger even if the previous one had not completed. Only trigger a setTimeout
            // once the previous check has completed.
            setTimeout(checkIteraction, pollingInterval)
          }
        } catch (error) {
          reject(error)
        }
      }

      // start first check
      checkIteraction()
    })
  }
}
