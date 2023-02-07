import { CliUx, Config } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../../api/APIConfiguration'
import { CheckStatus } from '../../api/CheckStatus'
import {
  CreateSimCheckResponse,
  SimCheckAPIClient,
} from '../../api/SimCheckAPIClient'
import { ClientCredentialsManager } from '../../api/TokenManager'
import { apiBaseUrlDR } from '../../DefaultUrls'
import ILogger from '../../helpers/ILogger'
import ChecksCreateCommand from '../../helpers/ChecksCreateCommand'

export default class SimChecksCreate extends ChecksCreateCommand {
  static description = 'Create SIMChecks within a Project'

  static typeOfCheck = 'SIMCheck'

  static flags = {
    ...ChecksCreateCommand.flags,
  }

  static args = [...ChecksCreateCommand.args]

  constructor(argv: string[], config: Config) {
    super(SimChecksCreate.typeOfCheck, 'sim_check', argv, config)
  }

  parseCommand() {
    return this.parse(SimChecksCreate)
  }

  getApiClient(
    apiConfiguration: APIClientCredentialsConfiguration,
    logger: ILogger,
  ): SimCheckAPIClient {
    const tokenManager = new ClientCredentialsManager(apiConfiguration, logger)

    return new SimCheckAPIClient(
      tokenManager,
      apiBaseUrlDR(
        this.projectConfig?.data_residency || 'eu',
        this.globalConfig!,
      ),
      logger,
    )
  }

  printDefault(response: CreateSimCheckResponse): void {
    if (response.status !== CheckStatus.COMPLETED) {
      this.log(
        `The ${this.typeOfCheck} could not be created. The ${this.typeOfCheck} status is ${response.status}`,
      )
      return
    }

    if (!this.flags.output) {
      this.log(`check_id: ${response.check_id}`)
      this.log(`status: ${response.status}`)
      this.log(`no_sim_change: ${response.no_sim_change}`)
      return
    }

    CliUx.ux.table(
      [response],
      {
        check_id: { header: 'check_id' },
        status: { header: 'status' },
        no_sim_change: { header: 'no_sim_change' },
      },
      { ...this.flags },
    )
  }
}
