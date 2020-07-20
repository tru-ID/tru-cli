import axios from "axios"
import {APIConfiguration} from './APIConfiguration'

export class Projects {
    axios: any
    apiConfig: APIConfiguration;

    constructor(apiConfig:APIConfiguration) {
        this.apiConfig = apiConfig
        this.axios = axios.create({
            baseURL: apiConfig.baseUrl
          });
    }

    async create(params:any) {
        return this.axios.post('/projects', params, {
            headers: {
                Authorization: `Bearer ${(await this.apiConfig.getAccessToken()).data.access_token}`
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

// export default Projects