import { CliUx, Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../api/APIConfiguration'
import { AbstractChecksApiClient } from '../api/ChecksAPIClient'
import { CheckStatus } from '../api/CheckStatus'
import { tokenUrlDR } from '../DefaultUrls'
import CommandWithProjectConfig from '../helpers/CommandWithProjectConfig'
import ILogger from '../helpers/ILogger'
import { promptForNumber } from './phone'
import { logApiError } from '../utilities'
import {
  doesProjectConfigExist,
  isProjectCredentialsValid,
} from './ValidationUtils'

export default abstract class ChecksCreateCommand extends CommandWithProjectConfig {
  static args = [
    {
      name: 'phone_number',
      required: false, // caught upon running and then user is prompted
      description: 'the phone number to perform the Check on',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    output: CliUx.ux.table.flags().output,
  }

  typeOfCheck: string

  tokenScope: string

  protected constructor(
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
    apiConfiguration: APIClientCredentialsConfiguration,
    logger: ILogger,
  ): AbstractChecksApiClient<any, any>

  async run(): Promise<void> {
    const result = await this.parseCommand()
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    await super.run()

    doesProjectConfigExist(this.projectConfig)
    isProjectCredentialsValid(this.projectConfig!)

    if (!this.projectConfig?.data_residency) {
      this.warn(
        'No data_residency specified in project config tru.json. It will default to eu',
      )
    }

    if (this.args.phone_number === undefined) {
      const response = await promptForNumber(this.typeOfCheck)

      this.args.phone_number = response.phone_number
    }

    const apiConfiguration: APIClientCredentialsConfiguration = {
      clientId: this.projectConfig!.credentials[0].client_id!,
      clientSecret: this.projectConfig!.credentials[0].client_secret!,
      scopes: [this.tokenScope],
      tokenUrl: tokenUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
    }

    const checkApiClient = this.getApiClient(apiConfiguration, this.logger)

    try {
      const response = await checkApiClient.create({
        phone_number: this.args.phone_number,
      })

      this.printResponse(response)
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
      return
    }
  }
  static isFinalCheckStatus(checkStatus: CheckStatus): boolean {
    return (
      checkStatus === CheckStatus.COMPLETED ||
      checkStatus === CheckStatus.EXPIRED ||
      checkStatus === CheckStatus.ERROR
    )
  }
}
