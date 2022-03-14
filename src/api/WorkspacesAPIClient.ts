import ILogger from '../helpers/ILogger'
import { HttpClient } from './HttpClient'
import { ILink, IListResource } from './IListResource'
import { RefreshTokenManager } from './TokenManager'

export type IWorkspaceResource = {
  workspace_id: string
  name: string
  data_residency: string
  created_at: string
  updated_at?: string
  _links: {
    self: ILink
  }
  _embedded: {
    balance: {
      currency: string
      amount_available: number
      amount_reserved: number
    }
    me: {
      role: string
      name: string
    }
  }
}

export interface IListWorkspaces extends IListResource {
  _embedded: {
    workspaces: IWorkspaceResource[]
  }
}

export class WorkspacesAPIClient {
  httpClient: HttpClient

  constructor(
    tokenManager: RefreshTokenManager,
    apiBaseUrl: string,
    logger: ILogger,
  ) {
    this.httpClient = new HttpClient(tokenManager, apiBaseUrl, logger)
  }

  async get(workspaceId: string): Promise<IWorkspaceResource> {
    const response: IWorkspaceResource =
      await this.httpClient.get<IWorkspaceResource>(
        `/console/v0.2/workspaces/${workspaceId}`,
        {},
        {},
      )
    return response
  }

  async getAll(): Promise<IListWorkspaces> {
    const response: IListWorkspaces =
      await this.httpClient.get<IListWorkspaces>(
        `/console/v0.2/workspaces`,
        {},
        {},
      )
    return response
  }
}
