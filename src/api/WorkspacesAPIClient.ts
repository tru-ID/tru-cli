import ILogger from '../helpers/ILogger'
import AbstractAPIClient from './AbstractAPIClient'
import { APIConfiguration } from './APIConfiguration'
import IAPICredentials from './IAPICredentails'
import { ILink } from './IListResource'

export type IWorkspaceResource = {
  data_residency: string
  created_at: string
  updated_at?: string
  credentials: IAPICredentials
  _links: {
    self: ILink
  }
  _embedded: {
    balance: {
      currency: string
      amount_available: number
      amount_reserved: number
      _links: {
        self: ILink
      }
    }
    // owner: {
    //     full_name: string,
    //     email: string
    // }
  }
}

export class WorkspacesAPIClient extends AbstractAPIClient {
  constructor(apiConfig: APIConfiguration, logger: ILogger) {
    super(apiConfig, logger)
  }

  async get(workspaceId: string): Promise<IWorkspaceResource> {
    const response: IWorkspaceResource =
      await this.httpClient.get<IWorkspaceResource>(
        `/console/v0.1/workspaces/${workspaceId}`,
        {},
        {},
      )
    return response
  }
}
