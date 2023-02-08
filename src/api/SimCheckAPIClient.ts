import ILogger from '../helpers/ILogger'
import { ILink } from './IListResource'
import { ClientCredentialsManager } from './TokenManager'
import {
  AbstractChecksApiClient,
  CheckResponse,
  CreateCheckResponse,
} from './ChecksAPIClient'

export type CreateSimCheckResponse = {
  no_sim_change: boolean
  no_sim_change_period: number
  sim_change_within: number
  updated_at: string
  network_id: string
  _links: {
    self: ILink
  }
} & CreateCheckResponse

export type SimCheckResponse = {
  no_sim_change: boolean
  no_sim_change_period: number
  sim_change_within: number
} & CheckResponse

export class SimCheckAPIClient extends AbstractChecksApiClient<
  CreateSimCheckResponse,
  SimCheckResponse
> {
  constructor(
    tokenManager: ClientCredentialsManager,
    apiBaseUrlDR: string,
    logger: ILogger,
  ) {
    super(tokenManager, apiBaseUrlDR, 'sim_check', logger)
  }
}
