import ILogger from '../helpers/ILogger'
import AbstractAPIClient from './AbstractAPIClient'
import { APIConfiguration } from './APIConfiguration'
import { CheckStatus } from './CheckStatus'
import { ILink, IListResource, IListResourceParameters } from './IListResource'
import {
  CheckTraceResource,
  IListCheckTracesResource,
  TraceApiClient,
} from './TraceAPIClient'

export interface ICreateCheckParameters {
  phone_number: string
}

export interface ICreateCheckResponse {
  check_id: string
  status: CheckStatus
  match: boolean
  charge_amount: number
  charge_currency: string
  created_at: string
  ttl: number
  snapshot_balance: number
  _links: {
    self: ILink
    check_url: ILink
  }
}

export type CheckResource = {
  check_id: string
  status: CheckStatus
  match: boolean
  charge_amount: number
  charge_currency: string
  created_at: string
  updated_at: string
  _links: {
    self: ILink
  }
}

export interface IListCheckResource<T> extends IListResource {
  _embedded: {
    checks: T[]
  }
}

export abstract class AbstractChecksApiClient<R>
  extends AbstractAPIClient
  implements TraceApiClient
{
  basePath: string

  constructor(apiConfig: APIConfiguration, logger: ILogger, basePath: string) {
    super(apiConfig, logger)
    this.basePath = basePath
  }

  async create(
    parameters: ICreateCheckParameters,
  ): Promise<ICreateCheckResponse> {
    const response: ICreateCheckResponse =
      await this.httpClient.post<ICreateCheckResponse>(
        `/${this.basePath}/v0.1/checks`,
        parameters,
        {},
      )
    return response
  }

  async patch(checkId: string, code: string): Promise<ICreateCheckResponse> {
    const response: ICreateCheckResponse =
      await this.httpClient.patch<ICreateCheckResponse>(
        `/${this.basePath}/v0.1/checks/${checkId}`,
        [{ op: 'add', path: '/code', value: code }],
        {
          'Content-Type': 'application/json-patch+json',
        },
      )
    return response
  }

  async get(checkId: string): Promise<R> {
    const response: R = await this.httpClient.get<R>(
      `/${this.basePath}/v0.1/checks/${checkId}`,
      {},
      {},
    )
    return response
  }

  async getTraces(checkId: string): Promise<IListCheckTracesResource> {
    const response: IListCheckTracesResource =
      await this.httpClient.get<IListCheckTracesResource>(
        `/${this.basePath}/v0.1/checks/${checkId}/traces`,
        {},
        {},
      )
    return response
  }

  async getTrace(
    checkId: string,
    traceId: string,
  ): Promise<CheckTraceResource> {
    const response: CheckTraceResource =
      await this.httpClient.get<CheckTraceResource>(
        `/${this.basePath}/v0.1/checks/${checkId}/traces/${traceId}`,
        {},
        {},
      )
    return response
  }

  async list(
    parameters?: IListResourceParameters,
  ): Promise<IListCheckResource<R>> {
    const response: IListCheckResource<R> = await this.httpClient.get<
      IListCheckResource<R>
    >(`/${this.basePath}/v0.1/checks`, parameters, {})
    return response
  }
}
