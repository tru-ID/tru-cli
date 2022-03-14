import ILogger from '../helpers/ILogger'
import { CheckStatus } from './CheckStatus'
import { HttpClient } from './HttpClient'
import { ILink, IListResource, IListResourceParameters } from './IListResource'
import { ClientCredentialsManager } from './TokenManager'
import {
  CheckTraceResource,
  IListCheckTracesResource,
  TraceApiClient,
} from './TraceAPIClient'

export interface ICreateSimCheck {
  phone_number: number
}

export interface ICreateSimCheckResponse extends ISimCheckResource {
  snapshot_balance: number
}

export type ISimCheckResource = {
  check_id: string
  status: CheckStatus.COMPLETED | CheckStatus.ERROR
  charge_amount: number
  charge_currency: string
  created_at: string
  no_sim_change: boolean
  _links: {
    self: ILink
  }
}

export interface IListSimCheckResource extends IListResource {
  _embedded: {
    checks: ISimCheckResource[]
  }
}

export interface IListCheckResource<T> extends IListResource {
  _embedded: {
    checks: T[]
  }
}

export class SimCheckAPIClient implements TraceApiClient {
  httpClient: HttpClient

  constructor(
    tokenManager: ClientCredentialsManager,
    baseApiUrlDR: string,
    logger: ILogger,
  ) {
    this.httpClient = new HttpClient(tokenManager, baseApiUrlDR, logger)
  }

  async create(parameters: ICreateSimCheck): Promise<ICreateSimCheckResponse> {
    const response: ICreateSimCheckResponse =
      await this.httpClient.post<ICreateSimCheckResponse>(
        `/sim_check/v0.1/checks`,
        parameters,
        {},
      )
    return response
  }

  async get(checkId: string): Promise<ICreateSimCheckResponse> {
    const response: ICreateSimCheckResponse =
      await this.httpClient.get<ICreateSimCheckResponse>(
        `/sim_check/v0.1/checks/${checkId}`,
        {},
        {},
      )
    return response
  }

  async getTraces(checkId: string): Promise<IListCheckTracesResource> {
    const response: IListCheckTracesResource =
      await this.httpClient.get<IListCheckTracesResource>(
        `/sim_check/v0.1/checks/${checkId}/traces`,
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
        `/sim_check/v0.1/checks/${checkId}/traces/${traceId}`,
        {},
        {},
      )
    return response
  }

  async list(
    parameters?: IListResourceParameters,
  ): Promise<IListSimCheckResource> {
    const response: IListSimCheckResource =
      await this.httpClient.get<IListSimCheckResource>(
        `/sim_check/v0.1/checks`,
        parameters,
        {},
      )
    return response
  }
}
