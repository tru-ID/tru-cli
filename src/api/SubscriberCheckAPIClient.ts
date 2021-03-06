import { APIConfiguration } from './APIConfiguration';
import ILogger from '../helpers/ILogger';
import { AbstractChecksApiClient, CheckResource } from './ChecksAPIClient';


export interface SubscriberCheckResource extends CheckResource {
    no_sim_change: boolean
}


export class SubscriberCheckAPIClient extends AbstractChecksApiClient<SubscriberCheckResource> {

    constructor(apiConfig: APIConfiguration, logger: ILogger) {
        super(apiConfig, logger, "subscriber_check")
    }
}
