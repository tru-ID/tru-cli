import ILogger from '../helpers/ILogger'
import {
  AbstractChecksApiClient,
  CheckResponse,
  CreateCheckResponse,
} from './ChecksAPIClient'
import { ClientCredentialsManager } from './TokenManager'
import { ILink } from './IListResource'

export type CreatePhoneCheckResponse = {
  url: string
  ttl: number
  _links: {
    self: ILink
    check_url: ILink
  }
} & CreateCheckResponse

export type PhoneCheckResponse = {
  match: boolean
} & CheckResponse

export class PhoneChecksAPIClient extends AbstractChecksApiClient<
  CreatePhoneCheckResponse,
  PhoneCheckResponse
> {
  constructor(
    tokenManager: ClientCredentialsManager,
    apiBaseUrlDR: string,
    logger: ILogger,
  ) {
    super(tokenManager, apiBaseUrlDR, 'phone_check', logger)
  }

  async patch(
    checkId: string,
    code: string,
  ): Promise<CreatePhoneCheckResponse> {
    const response: CreatePhoneCheckResponse =
      await this.httpClient.patch<CreatePhoneCheckResponse>(
        `/${this.productName}/v0.1/checks/${checkId}`,
        [{ op: 'add', path: '/code', value: code }],
        {
          'Content-Type': 'application/json-patch+json',
        },
      )
    return response
  }
}
