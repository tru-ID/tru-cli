import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import { string } from '@oclif/command/lib/flags'

export declare interface APIConfigurationArguments {
    clientId:string,
    clientSecret:string,
    baseUrl:string, // https://eu.api.4auth.io
}

export declare interface ICreateTokenResponse {
    access_token:string,
    id_token:string,
    expires_in:number,
    token_type:string,
    refresh_token:string,
    scope:string
}


export class APIConfiguration {
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

    async createAccessToken(): Promise<ICreateTokenResponse> {
        const auth:string = this.generateBasicAuth()
        const axiosResponse:AxiosResponse = await this.axios.post('/token', {
            grant_type: 'client_credentials',
            scope: 'projects'
        },{
            headers: {
                Authorization: `Basic ${auth}`
            }
        })

        const tokenResponse:ICreateTokenResponse = axiosResponse.data

        return tokenResponse
    }

     generateBasicAuth():string {
        const toEncode:string = `${this.clientId}:${this.clientSecret}`
        const auth = Buffer.from(toEncode).toString('base64')
        return auth
    }
}