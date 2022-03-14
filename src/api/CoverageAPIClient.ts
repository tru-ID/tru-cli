import axios from 'axios'
import ILogger from '../helpers/ILogger'
import { HttpClient } from './HttpClient'
import { ClientCredentialsManager } from './TokenManager'

export interface IPrice {
  currency: string
  amount: number
}

export interface INetworkPricing {
  network_id: string
  network_name: string
  prices?: IPrice[]
}

export interface IProduct {
  product_id: string
  product_name: string
}

export interface ICoverageInfo {
  coverage: string
  networks?: INetworkPricing[]
}

export type IProductCoverage = IProduct & ICoverageInfo

export type ICoverageReachResponse = {
  network_id: string
  network_name: string
  country_code: string
  products: IProduct[]
}

export interface ICoverageCountryResponse {
  country_code: string
  dialing_code: number
  products: IProductCoverage[]
}

export class CoverageAPIClient {
  baseApiUrl: string
  httpClient: HttpClient

  constructor(
    tokenManager: ClientCredentialsManager,
    baseApiUrl: string,
    logger: ILogger,
  ) {
    this.httpClient = new HttpClient(tokenManager, baseApiUrl, logger)
    this.baseApiUrl = baseApiUrl
  }

  async reach(deviceIp: string): Promise<ICoverageReachResponse | undefined> {
    let response: ICoverageReachResponse | undefined
    try {
      response = await this.httpClient.get<ICoverageReachResponse>(
        `/coverage/v0.1/device_ips/${deviceIp}`,
        {},
        {},
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (
          err.response?.status === 404 &&
          err.response?.data?.detail === 'No Reach'
        ) {
          response = undefined
        } else {
          throw err
        }
      } else {
        throw err
      }
    }
    return response
  }

  async countryReach(
    code: string,
  ): Promise<ICoverageCountryResponse | undefined> {
    let response: ICoverageCountryResponse | undefined
    try {
      response = await this.httpClient.get<ICoverageCountryResponse>(
        `/coverage/v0.1/countries/${code}`,
        {},
        {},
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (
          err.response?.status === 404 &&
          err.response?.data?.detail === 'No Reach'
        ) {
          response = undefined
        } else {
          throw err
        }
      } else {
        throw err
      }
    }
    return response
  }
}
