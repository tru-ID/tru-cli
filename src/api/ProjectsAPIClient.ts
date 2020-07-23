import axios from "axios"
import {APIConfiguration} from './APIConfiguration'

export class ProjectsAPIClient {
    axios: any
    apiConfig: APIConfiguration;

    constructor(apiConfig:APIConfiguration) {
        this.apiConfig = apiConfig

        this.axios = axios.create({
            baseURL: apiConfig.baseUrl
          });
    }

    async create(params:any) {
        const accessTokenResponse = await this.apiConfig.createAccessToken()
        console.log('Access Token Response:', accessTokenResponse)
        return this.axios.post('/console/v0.1/projects', params, {
            headers: {
                'Authorization': `Bearer ${accessTokenResponse.access_token}`
            }
        })
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