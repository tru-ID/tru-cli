
import { APIConfiguration } from './APIConfiguration'
import ILogger from '../helpers/ILogger';
import AbstractAPIClient from './AbstractAPIClient';
import { ILink, IListResource, IListResourceParameters } from './IListResource';
import { CheckStatus } from './CheckStatus';

export interface CheckLogResource {
    message: string
    timestamp: string
    attributes: any
}


export interface CheckTraceResource {
    trace_id: string
    logs: CheckLogResource[]
    _links: {
        self: ILink
    }
}


export interface IListCheckTracesResource {
    _embedded: {
        traces: CheckTraceResource[]
    }
    _links: {
        self: ILink
    }
}


export interface TraceApiClient {

    getTraces(checkId: string): Promise<IListCheckTracesResource>;

    getTrace(checkId: string, traceId: string): Promise<CheckTraceResource>;

}