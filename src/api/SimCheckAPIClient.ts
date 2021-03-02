import { APIConfiguration } from './APIConfiguration'
import ILogger from '../helpers/ILogger';
import AbstractAPIClient from './AbstractAPIClient';
import { ILink, IListResource, IListResourceParameters } from './IListResource';
import { CheckStatus } from './CheckStatus';
import { TraceApiClient, CheckTraceResource, IListCheckTracesResource } from './TraceAPIClient';


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


export interface IListCheckResource<T> extends IListResource {
    _embedded: {
        checks: T[]
    }
}




export class SimCheckAPIClient extends AbstractAPIClient implements TraceApiClient {

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

    async getTraces(checkId: string): Promise<IListCheckTracesResource> {
        const response: IListCheckTracesResource =
            await this.httpClient.get<IListCheckTracesResource>(`/${this.basePath}/v0.1/checks/${checkId}/traces`, {}, {})
        return response
    }

    async getTrace(checkId: string, traceId: string): Promise<CheckTraceResource> {
        const response: CheckTraceResource =
            await this.httpClient.get<CheckTraceResource>(`/${this.basePath}/v0.1/checks/${checkId}/traces/${traceId}`, {}, {})
        return response
    }

    async list(parameters?: IListResourceParameters): Promise<IListSimCheckResource> {
        const response: IListSimCheckResource =
            await this.httpClient.get<IListSimCheckResource>(`/${this.basePath}/v0.1/checks`, parameters, {})
        return response
    }
}

