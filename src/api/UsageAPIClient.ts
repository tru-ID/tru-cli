import ILogger from '../helpers/ILogger'
import { HttpClient } from './HttpClient'
import { IListResource } from './IListResource'
import { RefreshTokenManager } from './TokenManager'

export type UsageResource = {
  product_id?: string
  project_id?: string
  amount: number
  date: string
  currency: string
  counter: number
}

export interface UsageParameter {
  search: string
  group_by?: string
  page?: number
  size?: number
}

export interface IListUsageResource extends IListResource {
  _embedded: {
    usage: UsageResource[]
  }
}

export class UsageApiClient {
  httpClient: HttpClient
  logger: ILogger

  constructor(
    tokenManager: RefreshTokenManager,
    apiBaseUrl: string,
    logger: ILogger,
  ) {
    this.httpClient = new HttpClient(tokenManager, apiBaseUrl, logger)
    this.logger = logger
  }

  async getUsage(
    workspaceId: string,
    usageParameter: UsageParameter,
    typeOfUsage: string,
  ): Promise<IListUsageResource> {
    this.logger.debug('Get Usage parameters', usageParameter)

    const response: IListUsageResource =
      await this.httpClient.get<IListUsageResource>(
        `/console/v0.2/workspaces/${workspaceId}/usage/${typeOfUsage}`,
        usageParameter,
        {},
      )

    return response
  }
}
