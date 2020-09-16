import axios, { AxiosResponse, AxiosInstance, Method, AxiosRequestConfig } from 'axios'
import * as qs from 'querystring'

import { APIConfiguration } from './APIConfiguration'
import ILogger from '../helpers/ILogger'

interface IRequestLog {
    baseUrl: string,
    method: string
    url: string,
    body: any,
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

        this.axios.interceptors.request.use( config => {
            this.logRequest(config)
            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });

        this.axios.interceptors.response.use( (response: AxiosResponse) => {
            this.logResponse(response)
            return response;
        }, error => {
            this.logError(error)
            return Promise.reject(error);
        });
    }

    async post<T>(path:string, parameters:any, headers:any): Promise<T> {
        const accessTokenResponse = await this.createAccessToken()

        const requestHeaders = {
            ...headers,
            'Authorization': `Bearer ${accessTokenResponse.access_token}`
        }

        const response:AxiosResponse = await this.axios.post(path, parameters, {
                headers: requestHeaders
            })

        return response.data as T
    }

    async get<T>(path:string, parameters:any, headers:any): Promise<T> {
        const accessTokenResponse = await this.createAccessToken()

        const requestHeaders = {
            ...headers,
            'Authorization': `Bearer ${accessTokenResponse.access_token}`
        }

        const response:AxiosResponse = await this.axios.get(path, {
                params: parameters,
                headers: requestHeaders
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

        const response:AxiosResponse = await this.axios.post(path, params, {
            headers: requestHeaders
        })

        return response.data as ICreateTokenResponse
    }

     generateBasicAuth():string {
        const toEncode:string = `${this.config.clientId}:${this.config.clientSecret}`
        const auth = Buffer.from(toEncode).toString('base64')
        return auth
    }

    logRequest(config: AxiosRequestConfig): void {
        const log: IRequestLog = {
            baseUrl: config.baseURL ?? 'NOT SET',
            method: config.method?.toString() ?? 'NOT SET',
            url: config.url?.toString() ?? 'NOT SET',
            body: config.data,
            parameters: config.params,
            headers: config.headers
        }
        this.logger.debug('Request:', log)
    }

    logResponse(response: AxiosResponse): void {
        const log: IResponseLog = {
            statusCode: response.status,
            data: response.data,
            headers: response.headers
        }
        this.logger.debug('Response:', log)
    }

    logError(error: any): void {
        this.logger.debug('Error:', error)
    }

}