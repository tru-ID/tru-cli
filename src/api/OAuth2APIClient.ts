import AbstractAPIClient from './AbstractAPIClient'
import { APIConfiguration } from './APIConfiguration'
import ILogger from '../helpers/ILogger'
import { ICreateTokenResponse } from './HttpClient'

export class OAuth2APIClient extends AbstractAPIClient {
  constructor(apiConfig: APIConfiguration, logger: ILogger) {
    super(apiConfig, logger)
  }

  async create(): Promise<ICreateTokenResponse> {
    const response: ICreateTokenResponse =
      await this.httpClient.createAccessToken()
    return response
  }
}
