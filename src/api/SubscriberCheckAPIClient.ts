import ILogger from '../helpers/ILogger'
import {
  AbstractChecksApiClient,
  CheckResponse,
  CreateCheckResponse,
} from './ChecksAPIClient'
import { ILink } from './IListResource'
import { ClientCredentialsManager } from './TokenManager'

export type CreateSubscriberCheckResponse = {
  url: string
  ttl: number
  _links: {
    self: ILink
    check_url: ILink
  }
} & CreateCheckResponse

export type SubscriberCheckResponse = {
  match: boolean
  no_sim_change: boolean
  no_sim_change_period: number
  sim_change_within: number
} & CheckResponse

export class SubscriberCheckAPIClient extends AbstractChecksApiClient<
  CreateSubscriberCheckResponse,
  SubscriberCheckResponse
> {
  constructor(
    tokenManager: ClientCredentialsManager,
    apiBaseUrlDR: string,
    logger: ILogger,
  ) {
    super(tokenManager, apiBaseUrlDR, 'subscriber_check', logger)
  }
}
