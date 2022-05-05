import * as jsonpatch from 'fast-json-patch'
import ILogger from '../helpers/ILogger'
import { HttpClient } from './HttpClient'
import IAPICredentials from './IAPICredentails'
import { ILink, IListResource, IListResourceParameters } from './IListResource'
import { TokenManager } from './TokenManager'

export interface ICreateProjectPayload {
  name: string
  mode?: 'live' | 'sandbox'
  configuration?: {
    phone_check: {
      callback_url: string
      redirect_url?: string
    }
    subscriber_check?: {
      callback_url?: string
      redirect_url?: string
    }
  }
}

export interface IProjectResource {
  name: string
  project_id: string
  mode: 'live' | 'sandbox'
  disabled: boolean
  created_at: string
  updated_at: string

  configuration?: {
    phone_check?: {
      callback_url?: string
      redirect_url?: string
    }
    subscriber_check?: {
      callback_url?: string
      redirect_url?: string
    }
  }
  _links: {
    self: ILink
    my_credentials: ILink
  }
  [index: string]: any
}

export interface IProjectCreateResource extends IProjectResource {
  _embedded: {
    credentials: IAPICredentials[]
  }
}

export interface IUpdateProjectPayload {
  /**
   * Update the mode of the Project.
   */
  mode?: 'live' | 'sandbox'
  /**
   * `configuration` can only be added.
   */
  configuration?: {
    /**
     * `phone_check` alone cannot be manipulated. If `configuration` is present it `phone_check` must also be present.
     */
    phone_check?: {
      callback_url?: string
      redirect_url?: string
    }
    subscriber_check?: {
      callback_url?: string
      redirect_url?: string
    }
  }
}

export interface IListProjectsResponse extends IListResource {
  _embedded: {
    projects: IProjectResource[]
  }
}

export type IListProjectsParameters = IListResourceParameters

export class ProjectsAPIClient {
  httpClient: HttpClient
  logger: ILogger

  constructor(tokenManager: TokenManager, apiBaseUrl: string, logger: ILogger) {
    this.httpClient = new HttpClient(tokenManager, apiBaseUrl, logger)
    this.logger = logger
  }

  async create(
    workspaceId: string,
    params: any,
  ): Promise<IProjectCreateResource> {
    const response: IProjectCreateResource =
      await this.httpClient.post<IProjectCreateResource>(
        `/console/v0.2/workspaces/${workspaceId}/projects`,
        params,
        {},
      )
    return response
  }

  async get(workspaceId: string, projectId: string): Promise<IProjectResource> {
    const response: IProjectResource =
      await this.httpClient.get<IProjectResource>(
        `/console/v0.2/workspaces/${workspaceId}/projects/${projectId}`,
        {},
        {},
      )
    return response
  }

  async list(
    workspaceId: string,
    params?: IListProjectsParameters,
  ): Promise<IListProjectsResponse> {
    const response: IListProjectsResponse =
      await this.httpClient.get<IListProjectsResponse>(
        `/console/v0.2/workspaces/${workspaceId}/projects`,
        params,
        {},
      )
    return response
  }

  async update(
    workspaceId: string,
    projectId: string,
    params: IUpdateProjectPayload,
  ): Promise<IProjectResource> {
    let existingProject: IProjectResource = await this.get(
      workspaceId,
      projectId,
    )

    const observer: any = jsonpatch.observe(existingProject)

    this.logger.debug('Existing project', existingProject)
    this.logger.debug('Project update', params)

    existingProject = Object.assign(existingProject, params)
    const operations = jsonpatch.generate(observer)

    this.logger.debug('patch operations', operations)

    const response: IProjectResource =
      await this.httpClient.patch<IProjectResource>(
        `/console/v0.2/workspaces/${workspaceId}/projects/${projectId}`,
        operations,
        {
          'Content-Type': 'application/json-patch+json',
        },
      )
    return response
  }

  delete(): void {
    throw new Error('Not supported by the API')
  }
}
