import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"

interface APIConfigurationArguments {
    clientId:string,
    clientSecret:string,
    baseUrl:string
}

class APIConfiguration {
    clientId: string
    clientSecret: string
    baseUrl: string
    axios: any

    constructor(apiConfirationArguments: APIConfigurationArguments) {
        this.clientId = apiConfirationArguments.clientId
        this.clientSecret = apiConfirationArguments.clientSecret
        this.baseUrl = apiConfirationArguments.baseUrl

        this.axios = axios.create({
            baseURL: this.baseUrl
          });
    }

    async getAccessToken() {
        const auth:string = this.generateBasicAuth()
        const tokenResponse:any = await this.axios.post('/token', {
            grant_type: 'client_credentials',
            scope: 'projects'
        },{
            headers: `Authentication: Basic ${auth}`
        })

        return tokenResponse
    }

     generateBasicAuth():string {
        const toEncode:string = `${this.clientId}:${this.clientSecret}`
        const auth = new Buffer(toEncode).toString('base64')
        return auth
    }
}

export default APIConfiguration