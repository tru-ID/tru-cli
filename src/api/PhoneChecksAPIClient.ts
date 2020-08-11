import AbstractAPIClient from './AbstractAPIClient';
import { APIConfiguration } from './APIConfiguration';
import ILogger from '../helpers/ILogger';
import { IListResource, ILink, IListResourceParameters } from './IListResource';

export interface ICreatePhoneCheckParameters {
    phone_number: string
}

export enum PhoneCheckStatus {
    ACCEPTED = 'ACCEPTED',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED',
    ERROR = 'ERROR'
}

export interface ICreatePhoneCheckResponse extends IPhoneCheckResource {
    status: PhoneCheckStatus.ACCEPTED | PhoneCheckStatus.ERROR
    match: false
    _links: {
        self: ILink,
        check_url: ILink
    }
    snapshot_balance: number
}

export interface IPhoneCheckResource {
    check_id: string
    status: PhoneCheckStatus
    match: boolean
    charge_amount: number
    charge_currency: string
    created_at: string
    ttl: number
    _links: {
        self: ILink,
        check_url: ILink
    }
}

export interface IListPhoneCheckResponse extends IListResource {
    _embedded: {
        checks: IPhoneCheckResource[]
    }
}

export interface IListPhoneCheckParameters extends IListResourceParameters {
}

export class PhoneChecksAPIClient extends AbstractAPIClient {

    constructor(apiConfig:APIConfiguration, logger: ILogger) {
        super(apiConfig, logger)
    }

    async create(parameters:ICreatePhoneCheckParameters): Promise<ICreatePhoneCheckResponse> {
        const response:ICreatePhoneCheckResponse =
            await this.httpClient.post<ICreatePhoneCheckResponse>('/phone_check/v0.1/checks', parameters, {})
        return response
    }

    async get(checkId:string): Promise<IPhoneCheckResource> {
        const response:IPhoneCheckResource =
            await this.httpClient.get<IPhoneCheckResource>(`/phone_check/v0.1/checks/${checkId}`, {}, {})
        return response
    }

    async list(parameters?: IListPhoneCheckParameters): Promise<IListPhoneCheckResponse> {
        const response:IListPhoneCheckResponse =
            await this.httpClient.get<IListPhoneCheckResponse>(`/phone_check/v0.1/checks`, parameters, {})
        return response
    }
}