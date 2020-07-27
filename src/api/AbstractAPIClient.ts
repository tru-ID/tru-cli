import {APIConfiguration} from './APIConfiguration'
import {HttpClient} from './HttpClient'
import ILogger from '../helpers/ILogger';

export default abstract class AbstractAPIClient {
    httpClient: HttpClient;

    constructor(apiConfig:APIConfiguration, logger: ILogger) {
        this.httpClient = new HttpClient(apiConfig, logger)
    }
}