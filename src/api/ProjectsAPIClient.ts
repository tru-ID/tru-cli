import {APIConfiguration} from './APIConfiguration'
import ILogger from '../helpers/ILogger';
import AbstractAPIClient from './AbstractAPIClient';
import IAPICredentials from './IAPICredentails';

export interface ICreateProjectResponse {
    project_id: string
    name: string
    created_at: string
    updated_at: string
    credentials: IAPICredentials[],
    _links: {
        self: {
            href: string
        }
    }
}

export interface IProjectResource {
    project_id: string
    name: string
    created_at: string
    updated_at: string
    credentials: IAPICredentials[],
    _links: {
        self: {
            href: string
        }
    }    
}

export interface IListProjectsResponse {
    _links: {
        first: any,
        last: any,
        next: any,
        prev: any,
        self: any
    }
    _embedded: {
        projects: IProjectResource[]
    },
    page: {
        size: number,
        total_elements: number,
        total_pages: number,
        number: number
    }
}

export class ProjectsAPIClient extends AbstractAPIClient {

    constructor(apiConfig:APIConfiguration, logger: ILogger) {
        super(apiConfig, logger)
    }

    async create(params:any): Promise<ICreateProjectResponse> {
        const response:ICreateProjectResponse = await this.httpClient.post<ICreateProjectResponse>('/console/v0.1/projects', params, {})
        return response
    }

    async get(projectId:string): Promise<IProjectResource> {
        const response:IProjectResource =
            await this.httpClient.get<IProjectResource>(`/console/v0.1/projects/${projectId}`, {}, {})
        return response
    }

    async list(params?:any) {
        const response:IListProjectsResponse =
            await this.httpClient.get<IListProjectsResponse>('/console/v0.1/projects', params, {})
        return response
    }

    update() {
        throw new Error('Not supported by the API')
    }

    delete() {
        throw new Error('Not supported by the API')
    }

}