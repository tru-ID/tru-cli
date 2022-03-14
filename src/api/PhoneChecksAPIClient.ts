import ILogger from '../helpers/ILogger'
import { AbstractChecksApiClient, CheckResource } from './ChecksAPIClient'
import { ClientCredentialsManager } from './TokenManager'

export class PhoneChecksAPIClient extends AbstractChecksApiClient<CheckResource> {
  constructor(
    tokenManager: ClientCredentialsManager,
    apiBaseUrlDR: string,
    logger: ILogger,
  ) {
    super(tokenManager, apiBaseUrlDR, 'phone_check', logger)
  }
}
