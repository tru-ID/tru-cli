import * as jsonpatch from 'fast-json-patch'
import ILogger from '../helpers/ILogger'
import AbstractAPIClient from './AbstractAPIClient'
import { APIConfiguration } from './APIConfiguration'
import IAPICredentials from './IAPICredentails'
import { ILink, IListResource, IListResourceParameters } from './IListResource'

export interface IProjectResourceBase {
  configuration?: {
    phone_check?: {
      callback_url?: string
    }
  }
}

export interface ICreateProjectPayload {
  name: string
  mode?: 'live' | 'sandbox'
  configuration?: {
    phone_check: {
      callback_url: string
    }
  }
}

export type IProjectResource = {
  name: string
  project_id: string
  mode: 'live' | 'sandbox'
  created_at: string
  updated_at: string
  credentials: IAPICredentials[]
  configuration?: {
    phone_check?: {
      callback_url?: string
    }
  }
  _links: {
    self: ILink
  }
}

export interface IUpdateProjectPayload extends IProjectResourceBase {
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
    phone_check: {
      /**
       * The `callback_url` for PhoneCheck.
       */
      callback_url?: string
    }
  }
}

export interface IListProjectsResponse extends IListResource {
  _embedded: {
    projects: IProjectResource[]
  }
}

export type IListProjectsParameters = IListResourceParameters

export class ProjectsAPIClient extends AbstractAPIClient {
  constructor(apiConfig: APIConfiguration, logger: ILogger) {
    super(apiConfig, logger)
  }

  async create(params: any): Promise<IProjectResource> {
    const response: IProjectResource =
      await this.httpClient.post<IProjectResource>(
        '/console/v0.1/projects',
        params,
        {},
      )
    return response
  }

  async get(projectId: string): Promise<IProjectResource> {
    const response: IProjectResource =
      await this.httpClient.get<IProjectResource>(
        `/console/v0.1/projects/${projectId}`,
        {},
        {},
      )
    return response
  }

  async list(params?: IListProjectsParameters) {
    const response: IListProjectsResponse =
      await this.httpClient.get<IListProjectsResponse>(
        '/console/v0.1/projects',
        params,
        {},
      )
    return response
  }

  async update(
    projectId: string,
    params: IUpdateProjectPayload,
  ): Promise<IProjectResource> {
    let existingProject: IProjectResource = await this.get(projectId)

    const observer: any = jsonpatch.observe(existingProject)

    this.logger.debug('Existing project', existingProject)
    this.logger.debug('Project update', params)

    existingProject = Object.assign(existingProject, params)
    const operations = jsonpatch.generate(observer)

    this.logger.debug('patch operations', operations)

    const response: IProjectResource =
      await this.httpClient.patch<IProjectResource>(
        `/console/v0.1/projects/${projectId}`,
        operations,
        {
          'Content-Type': 'application/json-patch+json',
        },
      )
    return response
  }

  delete() {
    throw new Error('Not supported by the API')
  }
}
