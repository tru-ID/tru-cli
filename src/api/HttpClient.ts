import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import ILogger from '../helpers/ILogger'
import { TokenManager } from './TokenManager'

interface IRequestLog {
  baseUrl: string
  method: string
  url: string
  body: any
  parameters: any
  headers: any
}

interface IResponseLog {
  statusCode: number
  data: any
  headers: any
}

export class HttpClient {
  logger: ILogger

  axios: AxiosInstance

  tokenManager: TokenManager

  baseApiUrl: string

  constructor(tokenManager: TokenManager, baseApiUrl: string, logger: ILogger) {
    this.logger = logger
    this.baseApiUrl = baseApiUrl
    this.axios = axios.create({
      baseURL: this.baseApiUrl,
    })

    this.tokenManager = tokenManager

    this.axios.interceptors.request.use(
      (config) => {
        this.logRequest(config)
        return config
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error)
      },
    )

    this.axios.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logResponse(response)
        return response
      },
      (error) => {
        this.logError(error)
        return Promise.reject(error)
      },
    )
  }

  async post<T>(path: string, parameters: any, headers: any): Promise<T> {
    const accessToken = await this.tokenManager.getAccessToken()

    const requestHeaders = {
      ...headers,
      Authorization: `Bearer ${accessToken.access_token}`,
    }

    const response: AxiosResponse = await this.axios.post(path, parameters, {
      headers: requestHeaders,
    })

    return response.data as T
  }

  async patch<T>(path: string, operations: any[], headers: any): Promise<T> {
    const accessToken = await this.tokenManager.getAccessToken()

    const requestHeaders = {
      ...headers,
      Authorization: `Bearer ${accessToken.access_token}`,
    }

    const response: AxiosResponse = await this.axios.patch(path, operations, {
      headers: requestHeaders,
    })

    return response.data as T
  }

  async get<T>(path: string, parameters: any, headers: any): Promise<T> {
    const accessToken = await this.tokenManager.getAccessToken()

    const requestHeaders = {
      ...headers,
      Authorization: `Bearer ${accessToken.access_token}`,
    }

    const response: AxiosResponse = await this.axios.get(path, {
      params: parameters,
      headers: requestHeaders,
    })

    return response.data as T
  }

  logRequest(config: AxiosRequestConfig): void {
    const log: IRequestLog = {
      baseUrl: config.baseURL ?? 'NOT SET',
      method: config.method?.toString() ?? 'NOT SET',
      url: config.url?.toString() ?? 'NOT SET',
      body: config.data ? JSON.stringify(config.data, null, 1) : undefined,
      parameters: config.params,
      headers: config.headers,
    }
    this.logger.debug('Request:', log)
  }

  logResponse(response: AxiosResponse): void {
    const log: IResponseLog = {
      statusCode: response.status,
      data: response.data ? JSON.stringify(response.data, null, 1) : undefined,
      headers: response.headers,
    }
    this.logger.debug('Response:', log)
  }

  _filterRequest(request?: AxiosRequestConfig): any {
    if (!request) {
      return null
    }
    const allowed = ['string', 'object', 'number']
    const filtered = Object.keys(request)
      .filter((key) => allowed.includes(key))
      .reduce((obj: any, key: string) => {
        obj[key] = request[key as keyof AxiosRequestConfig]
        return obj
      }, {})
    return filtered
  }

  logError(error: any): void {
    let toLog: any = error

    // Axios errors have a lot of information so strip it down
    // to something more useful
    if (axios.isAxiosError(error)) {
      toLog = {
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        request: this._filterRequest(error.response?.config),
        data: error.response?.data || null,
      }
    }
    this.logger.debug('Error:', toLog)
  }
}
