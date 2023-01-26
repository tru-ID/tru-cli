import ILogger from '../helpers/ILogger'
import { HttpClient } from './HttpClient'
import { IListResource } from './IListResource'
import { RefreshTokenManager } from './TokenManager'

export type AnalyticsResource = {
  product_id: string
  workspace_id: string
  status: string
  match?: boolean
  no_sim_change?: boolean
  date: string
  counter: number
  project_id?: string
  network_id?: string
}

export interface AnalyticsParameter {
  search: string
  group_by?: string
  page?: number
  size?: number
}

export interface IListAnalyticsResource extends IListResource {
  _embedded: {
    analytics: AnalyticsResource[]
  }
}

export class AnalyticsApiClient {
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

  async getAnalytics(
    workspaceId: string,
    analyticsParameter: AnalyticsParameter,
    productId: string,
    timeBucket: string,
  ): Promise<IListAnalyticsResource> {
    this.logger.debug('Get Analytics parameters', analyticsParameter)

    const response: IListAnalyticsResource =
      await this.httpClient.get<IListAnalyticsResource>(
        `/console/v0.2/workspaces/${workspaceId}/analytics/${productId}/${timeBucket}`,
        analyticsParameter,
        {},
      )

    return response
  }
}
