import { flags } from '@oclif/command'
import * as Config from '@oclif/config'
import { cli } from 'cli-ux'
import { APIConfiguration } from '../api/APIConfiguration'
import {
  CheckLogResource,
  CheckTraceResource,
  TraceApiClient,
} from '../api/TraceAPIClient'
import { logApiError } from '../utilities'
import CommandWithProjectConfig from './CommandWithProjectConfig'
import ILogger from './ILogger'

export interface LogEntry {
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
      description: 'The check_id for which we want to get the traces',
    },
  ]

  static flags = {
    ...CommandWithProjectConfig.flags,
    ...cli.table.flags(),
    'trace-id': flags.string({
      description: 'The trace-id for which we want to get the logs',
      required: false,
    }),
  }

  typeOfCheck: string

  tokenScope: string

  constructor(
    typeOfCheck: string,
    tokenScope: string,
    argv: string[],
    config: Config.IConfig,
  ) {
    super(argv, config)
    this.typeOfCheck = typeOfCheck
    this.tokenScope = tokenScope
  }

  abstract parseCommand(): any

  abstract getApiClient(
    apiConfiguration: APIConfiguration,
    logger: ILogger,
  ): TraceApiClient

  async run() {
    const result = this.parseCommand()
    this.args = result.args
    this.flags = result.flags
    await this.loadProjectConfig()

    await super.run()

    let apiConfiguration = new APIConfiguration({
      clientId: this.projectConfig?.credentials[0].client_id,
      clientSecret: this.projectConfig?.credentials[0].client_secret,
      scopes: [this.tokenScope],
      baseUrl:
        this.globalConfig?.apiBaseUrlOverride ??
        `https://${this.globalConfig?.defaultWorkspaceDataResidency}.api.tru.id`,
    })

    const apiCheckClient = this.getApiClient(apiConfiguration, this.logger)

    if (this.flags.trace_id) {
      try {
        let singleResource = await apiCheckClient.getTrace(
          this.args.check_id,
          this.flags.trace_id,
        )

        this.displayResults(this.transform([singleResource], this.logger))
      } catch (error) {
        logApiError(this.log, error)
        this.exit(1)
      }
    } else {
      try {
        let listResource = await apiCheckClient.getTraces(this.args.check_id)

        this.displayResults(
          this.transform(listResource._embedded.traces, this.logger),
        )
      } catch (error) {
        logApiError(this.log, error)
        this.exit(1)
      }
    }
  }

  transform(resources: CheckTraceResource[], logger: ILogger): LogEntry[] {
    const result: LogEntry[] = []

    for (const traceResource of resources) {
      logger.debug('traceResource :', traceResource)

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

  displayResults(resources: LogEntry[]): any {
    cli.table(
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
}
