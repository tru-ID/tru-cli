import { APIConfiguration } from './APIConfiguration'
import ILogger from '../helpers/ILogger';
import AbstractAPIClient from './AbstractAPIClient';
import { IListResourceParameters } from './IListResource';


import { ILink, IListResource } from './IListResource';



export interface UsageResource {

    product_id?: string,
    project_id?: string,
    amount: number,
    date: string,
    currency: string,
    counter: number
}

export interface UsageParameter {

    search: string,
    group_by?: string

}


export interface IListUsageResource extends IListResource {
    _embedded: {
        usage: UsageResource[]
    }
}

export class UsageApiClient extends AbstractAPIClient {

    constructor(apiConfig: APIConfiguration, logger: ILogger) {
        super(apiConfig, logger)
    }

    async getUsage(usageParameter: UsageParameter, typeOfUsage: string): Promise<IListUsageResource> {

        this.logger.debug('Get Usage parameters', usageParameter);

        const response: IListUsageResource =
            await this.httpClient.get<IListUsageResource>(`/console/v0.1/workspaces/default/usage/${typeOfUsage}`, usageParameter, {})

        return response
    }

}