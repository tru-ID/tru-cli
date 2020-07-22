import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import * as qs from 'querystring'

export declare interface APIConfigurationArguments {
    clientId?:string,
    clientSecret?:string,
    baseUrl?:string, // https://eu.api.4auth.io
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
    clientId?: string
    clientSecret?: string
    baseUrl?: string
    private axios: any

    constructor(apiConfigurtionArguments: APIConfigurationArguments) {
        this.clientId = apiConfigurtionArguments.clientId
        this.clientSecret = apiConfigurtionArguments.clientSecret
        this.baseUrl = apiConfigurtionArguments.baseUrl

        this.axios = axios.create({
            baseURL: this.baseUrl
          });
    }

    async createAccessToken(): Promise<ICreateTokenResponse> {
        const path = '/oauth2/v1/token'
        const params = qs.stringify({
            grant_type: 'client_credentials',
            scope: 'projects',
            // client_id: this.clientId, // In body auth support
            // client_secret: this.clientSecret // In body auth support
        })
        const auth = this.generateBasicAuth()
        const headers = {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        console.log('Creating Access Token', {
            baseUrl: this.axios.defaults.baseURL,
            path: path,
            parameters: params,
            headers: headers
        })
        const axiosResponse:AxiosResponse = await this.axios.post(path, params, {
            headers: headers
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