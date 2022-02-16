import ILogger from '../helpers/ILogger'
import { APIConfiguration } from './APIConfiguration'
import { AbstractChecksApiClient } from './ChecksAPIClient'
import { CheckStatus } from './CheckStatus'
import { ILink } from './IListResource'

export type SubscriberCheckResource = {
  check_id: string
  status: CheckStatus
  match: boolean
  charge_amount: number
  charge_currency: string
  created_at: string
  updated_at: string
  _links: {
    self: ILink
  }
  no_sim_change: boolean
}

export class SubscriberCheckAPIClient extends AbstractChecksApiClient<SubscriberCheckResource> {
  constructor(apiConfig: APIConfiguration, logger: ILogger) {
    super(apiConfig, logger, 'subscriber_check')
  }
}
