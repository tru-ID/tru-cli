import { Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import { CheckStatus } from '../../api/CheckStatus'
import {
  ISimCheckResource,
  SimCheckAPIClient,
} from '../../api/SimCheckAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR, tokenUrlDR } from '../../DefaultUrls'
import CommandWithProjectConfig from '../../helpers/CommandWithProjectConfig'
import ILogger from '../../helpers/ILogger'
import { promptForNumber } from '../../helpers/phone'
import {
  doesProjectConfigExist,
  isProjectCredentialsValid,
  isWorkspaceSelected,
} from '../../helpers/ValidationUtils'
import { logApiError } from '../../utilities'

export default class SimChecksCreate extends CommandWithProjectConfig {
  static description = 'Create SIMChecks within a Project'

  static flags = {
    ...CommandWithProjectConfig.flags,
  }

  static args = [
    {
      name: 'phone_number',
      required: false, // caught upon running and then user is prompted
      description: 'The phone number to perform the SIMCheck on',
    },
  ]

  typeOfCheck = 'SIMCheck'

  tokenScope = 'sim_check'

  constructor(argv: string[], config: Config) {
    super(argv, config)
  }

  parseCommand() {
    return this.parse(SimChecksCreate)
  }

  async run() {
    const result = await this.parseCommand()
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    await super.run()

    doesProjectConfigExist(this.projectConfig)
    isProjectCredentialsValid(this.projectConfig!)
    isWorkspaceSelected(this.globalConfig!)

    if (this.args.phone_number === undefined) {
      const response = await promptForNumber(this.typeOfCheck)

      this.args.phone_number = response['phone_number']
    }

    this.log(`Creating ${this.typeOfCheck} for ${this.args.phone_number}\n`)

    const apiConfiguration: APIClientCredentialsConfiguration = {
      clientId: this.projectConfig!.credentials[0].client_id!,
      clientSecret: this.projectConfig!.credentials[0].client_secret!,
      scopes: [this.tokenScope],
      tokenUrl: tokenUrlDR(this.globalConfig!),
    }

    const simCheckApiClient = this.getApiClient(apiConfiguration, this.logger)

    let response: ISimCheckResource

    try {
      response = await simCheckApiClient.create({
        phone_number: this.args.phone_number,
      })
    } catch (error) {
      logApiError(this, error)
      this.exit(1)
      return
    }

    if (response.status === CheckStatus.COMPLETED) {
      this.log(`\tcheck_id: ${response.check_id}`)
      this.log(`\tstatus: ${response.status}`)
      this.log(`\tno_sim_change: ${response.no_sim_change}`)
    } else {
      this.log(
        `The ${this.typeOfCheck} could not be created. The ${this.typeOfCheck} status is ${response.status}`,
      )
      this.exit(1)
      return
    }
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,
    logger: ILogger,
  ): SimCheckAPIClient {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new SimCheckAPIClient(
      tokenManager,
      apiBaseUrlDR(this.globalConfig!),
      logger,
    )
  }
}
