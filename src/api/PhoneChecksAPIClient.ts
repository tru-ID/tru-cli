import AbstractAPIClient from './AbstractAPIClient';
import { APIConfiguration } from './APIConfiguration';
import ILogger from '../helpers/ILogger';

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

export interface ICreatePhoneCheckResponse {
    check_id: string
    check_url: string
    status: PhoneCheckStatus.ACCEPTED | PhoneCheckStatus.ERROR
    match: false
    charge_amount: number
    charge_currency: string
    created_at: string
    ttl: number
    _links: {
        self: {
            href: string
        }
    }
    snapshot_balance: number
}

export class PhoneChecksAPIClient extends AbstractAPIClient {

    constructor(apiConfig:APIConfiguration, logger: ILogger) {
        super(apiConfig, logger)
    }

    async create(parameters:ICreatePhoneCheckParameters) {
        const response:ICreatePhoneCheckResponse =
            await this.httpClient.post<ICreatePhoneCheckResponse>('/phone_check/v0.1/checks', parameters, {})
        return response
    }
}