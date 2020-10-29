import { APIConfiguration } from './APIConfiguration';
import ILogger from '../helpers/ILogger';
import { AbstractChecksApiClient, CheckResource } from './ChecksAPIClient';


export class PhoneChecksAPIClient extends AbstractChecksApiClient<CheckResource> {

    constructor(apiConfig: APIConfiguration, logger: ILogger) {
        super(apiConfig, logger, "phone_check")
    }
}