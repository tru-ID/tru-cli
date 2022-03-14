import axios, { AxiosInstance, AxiosResponse } from 'axios'
import fs from 'fs-extra'
import { Client, errors, Issuer, TokenSet } from 'openid-client'
import queryString from 'querystring'
import { jkwsUri } from '../DefaultUrls'
import ILogger from '../helpers/ILogger'
import { IGlobalAuthConfiguration } from '../IGlobalAuthConfiguration'
import {
  APIClientCredentialsConfiguration,
  APIRefreshTokenConfiguration,
} from './APIConfiguration'

declare type ICreateTokenResponse = {
  access_token: string
  id_token?: string
  expires_in: number
  token_type: string
  refresh_token?: string
  scope: string
}

export declare type AccessToken = {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

declare interface TokenStore {
  accessToken?: AccessToken
  refreshToken?: string
  dateInMs?: number
}

export interface TokenManager {
  getAccessToken(): Promise<AccessToken>
}

export type UserInfo = {
  data_residency: string
  workspace_membership_in: string[]
}

export class ClientCredentialsManager implements TokenManager {
  tokenStore: TokenStore | undefined
  logger: ILogger
  config: APIClientCredentialsConfiguration
  axios: AxiosInstance

  constructor(config: APIClientCredentialsConfiguration, logger: ILogger) {
    this.logger = logger
    this.config = config
    this.axios = axios.create({
      baseURL: this.config.tokenUrl,
    })
    this.tokenStore = {}
  }

  private hasValidToken(): boolean {
    if (this.tokenStore?.accessToken === undefined) {
      return false
    }

    return (
      this.tokenStore.dateInMs! +
        this.tokenStore.accessToken!.expires_in * 1000 +
        300 * 1000 >
      Date.now()
    )
  }

  private storeToken(tokenResponse: ICreateTokenResponse): void {
    this.tokenStore = {
      accessToken: {
        access_token: tokenResponse.access_token,
        expires_in: tokenResponse.expires_in,
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope,
      },
      dateInMs: Date.now(),
    }
  }

  async getAccessToken(): Promise<AccessToken> {
    if (this.hasValidToken()) {
      this.logger.debug('Token loaded from local')

      return this.tokenStore!.accessToken!
    }

    const auth = this.generateBasicAuth()

    const scopes = this.config.scopes.join(' ')
    const params = queryString.stringify({
      grant_type: 'client_credentials',
      scope: scopes,
    })

    const requestHeaders = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const response: AxiosResponse = await this.axios.post('', params, {
      headers: requestHeaders,
    })

    const data = response.data as ICreateTokenResponse

    this.logger.debug('Token created')

    await this.storeToken(data)

    return this.tokenStore!.accessToken!
  }

  private generateBasicAuth(): string {
    const toEncode = `${this.config.clientId}:${this.config.clientSecret}`
    const auth = Buffer.from(toEncode).toString('base64')
    return auth
  }
}

export class RefreshTokenManager implements TokenManager {
  logger: ILogger
  client: Client
  tokenStore: TokenStore | undefined
  configLocation: string

  constructor(config: APIRefreshTokenConfiguration, logger: ILogger) {
    this.logger = logger
    this.tokenStore = {
      refreshToken: config.refreshToken,
      dateInMs: new Date().setDate(-1),
    }

    this.configLocation = config.configLocation

    const issuer = new Issuer({
      issuer: config.issuerUrl + '/', // just needed for validation,
      token_endpoint: config.tokenUrl,
      jwks_uri: jkwsUri(config.issuerUrl),
    })

    this.client = new issuer.Client({
      client_id: 'cli_hq',
      token_endpoint_auth_method: 'none',
    })
  }

  private hasValidToken(): boolean {
    return (
      (this.tokenStore!.accessToken?.expires_in || Date.now()) <
      Date.now() - 5 * 60 * 1000
    )
  }

  private getToken(): AccessToken {
    return this.tokenStore!.accessToken!
  }

  async storeToken(tokenResponse: TokenSet): Promise<void> {
    this.tokenStore = {
      accessToken: {
        access_token: tokenResponse.access_token!,
        expires_in: tokenResponse.expires_in!,
        token_type: tokenResponse.token_type!,
        scope: tokenResponse.scope!,
      },
      dateInMs: Date.now(),
    }

    this.tokenStore.refreshToken = tokenResponse.refresh_token

    const globalConfig = await this.loadConfig(this.configLocation)

    globalConfig.tokenInfo = {
      refresh_token: this.tokenStore.refreshToken!,
      scope: this.tokenStore.accessToken!.scope!,
    }

    await this.saveConfig(this.configLocation, globalConfig)
  }

  async getAccessToken(): Promise<AccessToken> {
    if (this.hasValidToken()) {
      this.logger.debug('Token loaded from local')

      const accessToken: AccessToken = {
        access_token: this.getToken()!.access_token,
        expires_in: this.getToken()!.expires_in,
        token_type: this.getToken()!.token_type,
        scope: this.getToken()!.scope,
      }

      return accessToken
    }

    try {
      const token = await this.client.refresh(this.tokenStore!.refreshToken!)

      this.logger.debug('Token created')

      await this.storeToken(token)

      const accessToken: AccessToken = {
        access_token: this.getToken()!.access_token,
        expires_in: this.getToken()!.expires_in,
        token_type: this.getToken()!.token_type,
        scope: this.getToken()!.scope,
      }

      return accessToken
    } catch (error) {
      if (error instanceof errors.OPError || error instanceof errors.RPError) {
        throw new Error(
          `Error when creating token. Consider running setup:oauth2 to fix the issue. ${error.message}`,
        )
      }

      throw error
    }
  }

  async loadConfig(configLocation: string): Promise<IGlobalAuthConfiguration> {
    let config: IGlobalAuthConfiguration = {}
    if (!fs.existsSync(configLocation)) {
      throw new Error(`failed to read config file`)
    } else {
      try {
        config = await fs.readJson(configLocation)
      } catch (err) {
        throw new Error(`failed to read config file: ${err}`)
      }
    }
    return config
  }

  async saveConfig(
    configLocation: string,
    config: IGlobalAuthConfiguration,
  ): Promise<void> {
    await fs.outputJson(configLocation, config, { spaces: 2 })
  }
}
