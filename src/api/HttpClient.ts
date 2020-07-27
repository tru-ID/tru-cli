import axios, { AxiosResponse, AxiosInstance } from 'axios'
import * as qs from 'querystring'

import { APIConfiguration } from './APIConfiguration'
import ILogger from '../helpers/ILogger'

interface IRequestLog {
    baseUrl: string,
    method: 'post'| 'get' | 'patch'
    path: string,
    parameters: any,
    headers: any
}

interface IResponseLog {
    statusCode: number,
    data: any,
    headers: any
}

export declare interface ICreateTokenResponse {
    access_token:string,
    id_token:string,
    expires_in:number,
    token_type:string,
    refresh_token:string,
    scope:string
}

export class HttpClient {
    config:APIConfiguration
    logger:ILogger
    axios:AxiosInstance

    constructor(apiConfiguration: APIConfiguration, logger:ILogger) {
        this.config = apiConfiguration
        this.logger = logger
        this.axios = axios.create({
            baseURL: this.config.baseUrl
          });
    }

    async post<T>(path:string, parameters:any, headers:any): Promise<T> {
        const accessTokenResponse = await this.createAccessToken()

        const requestHeaders = {
            ...headers,
            'Authorization': `Bearer ${accessTokenResponse.access_token}`
        }

        this.logRequest({
            baseUrl: this.axios.defaults.baseURL ?? 'NOT SET',
            method: 'post',
            path: path,
            parameters: parameters,
            headers: requestHeaders
        })

        const response:AxiosResponse = await this.axios.post(path, parameters, {
                headers: requestHeaders
            })
        
        this.logResponse({
            statusCode: response.status,
            data: response.data,
            headers: response.headers
        })

        return response.data as T
    }

    async get<T>(path:string, parameters:any, headers:any): Promise<T> {
        const accessTokenResponse = await this.createAccessToken()

        const requestHeaders = {
            ...headers,
            'Authorization': `Bearer ${accessTokenResponse.access_token}`
        }

        this.logRequest({
            baseUrl: this.axios.defaults.baseURL ?? 'NOT SET',
            method: 'get',
            path: path,
            parameters: parameters,
            headers: requestHeaders
        })

        const response:AxiosResponse = await this.axios.get(path, {
                params: parameters,
                headers: requestHeaders
            })
        
        this.logResponse({
            statusCode: response.status,
            data: response.data,
            headers: response.headers
        })

        return response.data as T
    }

    async createAccessToken(): Promise<ICreateTokenResponse> {
        const path = '/oauth2/v1/token'
        const params = qs.stringify({
            grant_type: 'client_credentials',
            scope: this.config.scopes,
            // client_id: this.clientId, // In body auth support
            // client_secret: this.clientSecret // In body auth support
        })
        const auth = this.generateBasicAuth()
        const requestHeaders = {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        this.logRequest({
            baseUrl: this.axios.defaults.baseURL ?? 'NOT SET',
            method: 'post',
            path: path,
            parameters: params,
            headers: requestHeaders
        })

        const response:AxiosResponse = await this.axios.post(path, params, {
            headers: requestHeaders
        })

        this.logResponse({
            statusCode: response.status,
            data: response.data,
            headers: response.headers
        })

        return response.data as ICreateTokenResponse
    }

     generateBasicAuth():string {
        const toEncode:string = `${this.config.clientId}:${this.config.clientSecret}`
        const auth = Buffer.from(toEncode).toString('base64')
        return auth
    }

    logRequest(log: IRequestLog): void {
        this.logger.debug('Request:', log)
    }

    logResponse(log: IResponseLog): void {
        this.logger.debug('Response:', log)
    }

}