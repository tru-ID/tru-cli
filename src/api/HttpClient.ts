import axios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios'
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
    access_token: string,
    id_token: string,
    expires_in: number,
    token_type: string,
    refresh_token: string,
    scope: string
}

interface TokenStore {
    response: ICreateTokenResponse
    dateInMs: number
}


export class HttpClient {

    tokens: TokenStore | undefined
    config: APIConfiguration
    logger: ILogger
    axios: AxiosInstance

    constructor(apiConfiguration: APIConfiguration, logger: ILogger) {
        this.config = apiConfiguration
        this.logger = logger
        this.axios = axios.create({
            baseURL: this.config.baseUrl
        });

        this.axios.interceptors.request.use(config => {
            this.logRequest(config)
            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });

        this.axios.interceptors.response.use((response: AxiosResponse) => {
            this.logResponse(response)
            return response;
        }, error => {
            this.logError(error)
            return Promise.reject(error);
        });
    }

    async post<T>(path: string, parameters: any, headers: any): Promise<T> {
        const accessTokenResponse = await this.createAccessToken()

        const requestHeaders = {
            ...headers,
            'Authorization': `Bearer ${accessTokenResponse.access_token}`
        }

        const response: AxiosResponse = await this.axios.post(path, parameters, {
            headers: requestHeaders
        })

        return response.data as T
    }

    async patch<T>(path: string, operations: any[], headers: any): Promise<T> {
        const accessTokenResponse = await this.createAccessToken()

        const requestHeaders = {
            ...headers,
            'Authorization': `Bearer ${accessTokenResponse.access_token}`
        }

        const response: AxiosResponse = await this.axios.patch(path, operations, {
            headers: requestHeaders
        })

        return response.data as T
    }

    async get<T>(path: string, parameters: any, headers: any): Promise<T> {

        const accessTokenResponse = await this.createAccessToken()

        const requestHeaders = {
            ...headers,
            'Authorization': `Bearer ${accessTokenResponse.access_token}`
        }

        const response: AxiosResponse = await this.axios.get(path, {
            params: parameters,
            headers: requestHeaders
        })


        return response.data as T
    }

    async createAccessToken(): Promise<ICreateTokenResponse> {

        
        if (this.hasValidToken()) {
            this.logger.debug("Token loaded from local")
            return this.getToken()!
        }

        const auth = this.generateBasicAuth()

        const path = '/oauth2/v1/token'
        const scopes = this.config.scopes || ''
        const params = qs.stringify({
            grant_type: 'client_credentials',
            scope: scopes
        })

        const requestHeaders = {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }


        const response: AxiosResponse = await this.axios.post(path, params, {
            headers: requestHeaders
        })

        this.logger.debug("Token created")

        this.storeToken(response.data as ICreateTokenResponse)

        return response.data as ICreateTokenResponse
    }

    hasValidToken(): boolean {

        if(this.tokens == undefined) {
            return false
        }    

        return (this.tokens.dateInMs + this.tokens.response.expires_in * 1000 + 300 * 1000) > Date.now()
    }

    getToken(): ICreateTokenResponse | undefined {

        return this.tokens?.response

    }

    storeToken(tokenResponse: ICreateTokenResponse) {

        this.tokens = {
            response: tokenResponse,
            dateInMs: Date.now()
        }

    }

    generateBasicAuth(): string {
        const toEncode: string = `${this.config.clientId}:${this.config.clientSecret}`
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

    _filterRequest(request: any) {
        const allowed = ['string', 'object', 'number']
        const filtered = Object.keys(request)
            .filter(key => allowed.includes(typeof request[key]))
            .reduce((obj: any, key: string) => {
                obj[key] = request[key];
                return obj;
            }, {});
        return filtered
    }

    logError(error: any): void {
        let toLog: any = error

        // Axios errors have a lot of information so strip it down
        // to something more useful
        if (error.isAxiosError) {
            toLog = {
                statusCode: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                request: this._filterRequest(error.response.config),
                data: error.response?.data || null
            }
        }
        this.logger.debug('Error:', toLog)
    }

}