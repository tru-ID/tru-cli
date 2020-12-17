import { AxiosError } from 'axios';
import AbstractAPIClient from './AbstractAPIClient';

export interface IPrice {
    currency: string,
    amount: number
}

export interface INetworkPricing {
    network_id: string,
    network_name: string,
    prices: IPrice[]
}

export interface IProduct {
    product_id: string;
    product_name: string;
}

export interface ICoverageInfo {
    coverage: string;
    networks: INetworkPricing[]
}

export type IProductCoverage = IProduct & ICoverageInfo

export interface ICoverageReachResponse {
    network_id: string,
    network_name: string,
    country_code: string,
    products: IProduct[]
}

export interface ICoverageCountryResponse {
    country_code: string,
    dialing_code: number,
    products: IProductCoverage[]
}

export class CoverageAPIClient extends AbstractAPIClient {
    async reach(deviceIp: string): Promise<ICoverageReachResponse | undefined> {
        let response: ICoverageReachResponse | undefined
        try {
            response = await this.httpClient.get<ICoverageReachResponse>(`/coverage/v0.1/device_ips/${deviceIp}`, {}, {})
        } catch (err) {
            const axiosErrorResponse = (err as AxiosError).response;
            // we want to handle no reach as a valid response
            if (axiosErrorResponse &&
                axiosErrorResponse.status === 404 &&
                axiosErrorResponse.data?.detail === "No Reach") {
                response = undefined
            } else {
                throw err
            }
        }
        return response
    }

    async countryReach(code: string): Promise<ICoverageCountryResponse | undefined> {
        let response: ICoverageCountryResponse | undefined
        try {
            response = await this.httpClient.get<ICoverageCountryResponse>(`/coverage/v0.1/countries/${code}`, {}, {})
        } catch (err) {
            const axiosErrorResponse = (err as AxiosError).response;
            // we want to handle no reach as a valid response
            if (axiosErrorResponse &&
                axiosErrorResponse.status === 404 &&
                axiosErrorResponse.data?.detail === "No Reach") {
                response = undefined
            } else {
                throw err
            }
        }
        return response
    }
}