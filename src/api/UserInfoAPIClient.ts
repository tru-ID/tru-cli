import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { RefreshTokenManager, UserInfo } from './TokenManager'

export class UserInfoAPIClient {
  tokenManager: RefreshTokenManager
  axios: AxiosInstance

  constructor(loginBaseUrl: string, tokenManager: RefreshTokenManager) {
    this.tokenManager = tokenManager
    this.axios = axios.create({
      baseURL: loginBaseUrl,
    })
  }

  async post(): Promise<UserInfo> {
    const accessToken = await this.tokenManager.getAccessToken()

    const requestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const response: AxiosResponse = await this.axios.post<UserInfo>(
      'login/userinfo',
      null,
      {
        headers: requestHeaders,
        params: {
          access_token: accessToken.access_token,
        },
      },
    )

    return response.data
  }
}
