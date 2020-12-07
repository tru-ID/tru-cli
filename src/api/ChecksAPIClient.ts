import {APIConfiguration} from './APIConfiguration'
import {HttpClient} from './HttpClient'
import ILogger from '../helpers/ILogger';
import AbstractAPIClient from './AbstractAPIClient';
import { IListResourceParameters } from './IListResource';


import { ILink, IListResource } from './IListResource';
import { CheckStatus } from './CheckStatus';


export interface ICreateCheckParameters {
    phone_number: string
}

export interface ICreateCheckResponse {
    check_id: string
    status: CheckStatus
    match: boolean
    charge_amount: number
    charge_currency: string
    created_at: string
    ttl: number
    snapshot_balance: number
    _links: {
        self: ILink,
        check_url: ILink
    }
}

export interface CheckResource {
    check_id: string
    status: CheckStatus
    match: boolean
    charge_amount: number
    charge_currency: string
    created_at: string
    updated_at: string
    _links: {
        self: ILink,
    }
}

export interface IListCheckResource<T> extends IListResource {
    _embedded: {
        checks: T[]
    }
}


export abstract class AbstractChecksApiClient<R> extends AbstractAPIClient {

    basePath: string

    constructor(apiConfig: APIConfiguration, logger: ILogger, basePath: string) {
        super(apiConfig, logger)
        this.basePath = basePath
    }

    async create(parameters: ICreateCheckParameters): Promise<ICreateCheckResponse> {
        const response: ICreateCheckResponse =
            await this.httpClient.post<ICreateCheckResponse>(`/${this.basePath}/v0.1/checks`, parameters, {})
        return response
    }

    async get(checkId: string): Promise<R> {
        const response: R =
            await this.httpClient.get<R>(`/${this.basePath}/v0.1/checks/${checkId}`, {}, {})
        return response
    }

    async list(parameters?: IListResourceParameters): Promise<IListCheckResource<R>> {
        const response: IListCheckResource<R> =
            await this.httpClient.get<IListCheckResource<R>>(`/${this.basePath}/v0.1/checks`, parameters, {})
        return response
    }
  
}