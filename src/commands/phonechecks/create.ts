import { CliUx, Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import {
  CreatePhoneCheckResponse,
  PhoneCheckResponse,
  PhoneChecksAPIClient,
} from '../../api/PhoneChecksAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'
import ILogger from '../../helpers/ILogger'
import { CheckStatus } from '../../api/CheckStatus'

export default class PhoneChecksCreate extends ChecksCreateCommand {
  static description = 'Creates a PhoneCheck within a project'

  static typeOfCheck = 'PhoneCheck'

  static flags = {
    ...ChecksCreateCommand.flags,
  }

  static args = [...ChecksCreateCommand.args]

  constructor(argv: string[], config: Config) {
    super(PhoneChecksCreate.typeOfCheck, 'phone_check', argv, config)
  }

  getPolling(): number {
    return (
      this.globalConfig?.phoneCheckWorkflowRetryMillisecondsOverride ?? 5000
    )
  }

  async parseCommand() {
    return await this.parse(PhoneChecksCreate)
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,
    logger: ILogger,
  ): PhoneChecksAPIClient {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new PhoneChecksAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
      logger,
    )
  }

  async waitForFinalCheckState(
    checkApiClient: PhoneChecksAPIClient,
    createCheckResponse: CreatePhoneCheckResponse,
  ): Promise<PhoneCheckResponse> {
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

  printDefault(response: CreatePhoneCheckResponse): void {
    if (response.status !== CheckStatus.ACCEPTED) {
      this.log(
        `The ${this.typeOfCheck} could not be created. The ${this.typeOfCheck} status is ${response.status}`,
      )
      return
    }

    if (!this.flags.output) {
      this.log(`${this.typeOfCheck} ACCEPTED`)
      this.log(`check_id: ${response.check_id}`)
      this.log(`check_url: ${response.url}`)
      return
    }

    CliUx.ux.table(
      [response],
      {
        status: { header: 'status' },
        check_id: { header: 'check_id' },
        url: { header: 'check_url' },
      },
      { ...this.flags },
    )
  }
}
