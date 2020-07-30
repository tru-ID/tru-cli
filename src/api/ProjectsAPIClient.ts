import {APIConfiguration} from './APIConfiguration'
import {HttpClient} from './HttpClient'
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

export class ProjectsAPIClient extends AbstractAPIClient {

    constructor(apiConfig:APIConfiguration, logger: ILogger) {
        super(apiConfig, logger)
    }

    async create(params:any): Promise<ICreateProjectResponse> {
        const response:ICreateProjectResponse = await this.httpClient.post<ICreateProjectResponse>('/console/v0.1/projects', params, {})
        return response
    }

    list() {
        throw new Error('Not implemeneted in the CLI')
    }

    update() {
        throw new Error('Not supported by the API')
    }

    delete() {
        throw new Error('Not supported by the API')
    }

}