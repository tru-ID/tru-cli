import { CliUx, Config, Flags } from '@oclif/core'
import { APIClientCredentialsConfiguration } from '../api/APIConfiguration'
import {
  CheckLogResource,
  CheckTraceResource,
  IListCheckTracesResource,
  TraceApiClient,
} from '../api/TraceAPIClient'
import { tokenUrlDR } from '../DefaultUrls'
import { logApiError, printJson } from '../utilities'
import CommandWithProjectConfig from './CommandWithProjectConfig'
import ILogger from './ILogger'
import {
  doesProjectConfigExist,
  isProjectCredentialsValid,
} from './ValidationUtils'

export type LogEntry = {
  trace_id: string
  message: string
  timestamp: string
  attributes: CheckLogResource
}

export default abstract class ChecksTraceCommand extends CommandWithProjectConfig {
  static args = [
    {
      name: 'check_id',
      required: true,
      description: 'the check_id for which we want to get the traces',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...CliUx.ux.table.flags(),
    'trace-id': Flags.string({
      description: 'the trace-id for which we want to get the logs',
      required: false,
    }),
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
  ): TraceApiClient

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

    if (this.flags['trace-id']) {
      try {
        const singleResource = await checkApiClient.getTrace(
          this.args.check_id,
          this.flags['trace-id'],
        )

        this.printResponse(singleResource, true)
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    } else {
      try {
        const listResource = await checkApiClient.getTraces(this.args.check_id)

        this.printResponse(listResource)
      } catch (error) {
        logApiError(this, error)
        this.exit(1)
      }
    }
  }

  transform(resources: CheckTraceResource[]): LogEntry[] {
    const result: LogEntry[] = []

    for (const traceResource of resources) {
      this.logger.debug('traceResource :', traceResource)

      for (const logResource of traceResource.logs) {
        const transformed = {
          trace_id: traceResource.trace_id,
          timestamp: logResource.timestamp,
          message: logResource.message,
          attributes: logResource.attributes,
        }

        result.push(transformed)
      }
    }

    return result
  }

  printDefault(resources: LogEntry[]): void {
    CliUx.ux.table(
      resources,
      {
        trace_id: {
          header: 'trace_id',
        },
        timestamp: {
          header: 'timestamp',
        },
        message: {
          header: 'message',
        },
        attributes: {
          header: 'attributes',
          extended: true,
        },
      },
      {
        printLine: (s: any) => {
          this.logger!.info(s)
        },
        ...this.flags, // parsed flags
      },
    )
  }

  printResponse(
    response: CheckTraceResource | IListCheckTracesResource,
    printSingle?: boolean,
  ): void {
    if (this.flags.output === 'json') {
      printJson(this.logger, response)
      return
    }

    if (printSingle) {
      const singleResponse = response as CheckTraceResource
      this.printDefault(this.transform([singleResponse]))
      return
    }

    const listResponse = response as IListCheckTracesResource
    this.printDefault(this.transform(listResponse._embedded.traces))
  }
}
