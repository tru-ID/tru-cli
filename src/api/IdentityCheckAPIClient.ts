import { APIConfiguration } from './APIConfiguration';
import ILogger from '../helpers/ILogger';
import { AbstractChecksApiClient, CheckResource } from './ChecksAPIClient';


export interface IdentityCheckResource extends CheckResource {
    last_sim_change_at: string,
    no_sim_change: boolean
}


export class IdentityCheckAPIClient extends AbstractChecksApiClient<IdentityCheckResource> {

    constructor(apiConfig: APIConfiguration, logger: ILogger) {
        super(apiConfig, logger, "identity_check")
    }
}
