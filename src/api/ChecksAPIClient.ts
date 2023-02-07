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

export interface ICreateCheckParameters {
  phone_number: string
}

export type CreateCheckResponse = {
  check_id: string
  status: CheckStatus
  charge_amount: number
  charge_currency: string
  created_at: string
  snapshot_balance: number
}

export type CheckResponse = {
  check_id: string
  status: CheckStatus
  charge_amount: number
  charge_currency: string
  created_at: string
  updated_at: string
  network_id: string
  _links: {
    self: ILink
  }
}

export interface IListCheckResource<T> extends IListResource {
  _embedded: {
    checks: T[]
  }
}

export abstract class AbstractChecksApiClient<C, R> implements TraceApiClient {
  baseApiUrl: string
  httpClient: HttpClient
  productName: string
  tokenManager: ClientCredentialsManager

  protected constructor(
    tokenManager: ClientCredentialsManager,
    baseApiUrlDR: string,
    productName: string,
    logger: ILogger,
  ) {
    this.tokenManager = tokenManager
    this.httpClient = new HttpClient(tokenManager, baseApiUrlDR, logger)
    this.baseApiUrl = baseApiUrlDR
    this.productName = productName
  }

  async create(parameters: ICreateCheckParameters): Promise<C> {
    return await this.httpClient.post<C>(
      `/${this.productName}/v0.1/checks`,
      parameters,
      {},
    )
  }

  async get(checkId: string): Promise<R> {
    return await this.httpClient.get<R>(
      `/${this.productName}/v0.1/checks/${checkId}`,
      {},
      {},
    )
  }

  async getTraces(checkId: string): Promise<IListCheckTracesResource> {
    return await this.httpClient.get<IListCheckTracesResource>(
      `/${this.productName}/v0.1/checks/${checkId}/traces`,
      {},
      {},
    )
  }

  async getTrace(
    checkId: string,
    traceId: string,
  ): Promise<CheckTraceResource> {
    return await this.httpClient.get<CheckTraceResource>(
      `/${this.productName}/v0.1/checks/${checkId}/traces/${traceId}`,
      {},
      {},
    )
  }

  async list(
    parameters?: IListResourceParameters,
  ): Promise<IListCheckResource<R>> {
    return await this.httpClient.get<IListCheckResource<R>>(
      `/${this.productName}/v0.1/checks`,
      parameters,
      {},
    )
  }
}
