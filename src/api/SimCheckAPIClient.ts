import { APIConfiguration } from './APIConfiguration'
import { HttpClient } from './HttpClient'
import ILogger from '../helpers/ILogger';
import AbstractAPIClient from './AbstractAPIClient';
import { ILink, IListResource, IListResourceParameters } from './IListResource';
import { CheckStatus } from './CheckStatus';

export interface ICreateSimCheck {
    phone_number: number
}

export interface ICreateSimCheckResponse extends ISimCheckResource {
    snapshot_balance: number
}

export interface ISimCheckResource {
    check_id: string
    status: CheckStatus.COMPLETED | CheckStatus.ERROR
    charge_amount: number
    charge_currency: string
    created_at: string
    last_sim_change_at: string
    no_sim_change: boolean
    _links: {
        self: ILink
    }
}

export interface IListSimCheckResource extends IListResource {
    _embedded: {
        checks: ISimCheckResource[]
    }
}


export class SimCheckAPIClient extends AbstractAPIClient {

    basePath = "sim_check"

    constructor(apiConfig: APIConfiguration, logger: ILogger) {
        super(apiConfig, logger)
    }

    async create(parameters: ICreateSimCheck): Promise<ICreateSimCheckResponse> {
        const response: ICreateSimCheckResponse =
            await this.httpClient.post<ICreateSimCheckResponse>(`/${this.basePath}/v0.1/checks`, parameters, {})
        return response
    }

    async get(checkId: string): Promise<ICreateSimCheckResponse> {
        const response: ICreateSimCheckResponse =
            await this.httpClient.get<ICreateSimCheckResponse>(`/${this.basePath}/v0.1/checks/${checkId}`, {}, {})
        return response
    }

    async list(parameters?: IListResourceParameters): Promise<IListSimCheckResource> {
        const response: IListSimCheckResource =
            await this.httpClient.get<IListSimCheckResource>(`/${this.basePath}/v0.1/checks`, parameters, {})
        return response
    }
}

