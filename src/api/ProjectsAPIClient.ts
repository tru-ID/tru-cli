import {APIConfiguration} from './APIConfiguration'
import {HttpClient} from './HttpClient'
import ILogger from '../helpers/ILogger';

export interface ICredentials {
    client_id: string,
    client_secret: string,
    created_at: string
}
export interface ICreateProjectResponse {
        project_id: string
        name: string
        created_at: string
        updated_at: string
        credentials: ICredentials[],
        _links: {
        self: {
            href: string
        }
    }
}

export class ProjectsAPIClient {
    axios: any
    httpClient: HttpClient;

    constructor(apiConfig:APIConfiguration, logger: ILogger) {
        this.httpClient = new HttpClient(apiConfig, logger)
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