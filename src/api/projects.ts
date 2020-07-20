import axios from "axios"
import APIConfiguration from './APIConfiguration'

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
            headers: {'Authentication: Bearer': await this.apiConfig.getAccessToken()}
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