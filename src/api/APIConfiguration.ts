export declare interface APIConfigurationArguments {
    clientId?:string,
    clientSecret?:string,
    baseUrl?:string, // https://eu.api.4auth.io
}

export class APIConfiguration {
    clientId?: string
    clientSecret?: string
    baseUrl?: string
    private axios: any

    constructor(apiConfigurtionArguments: APIConfigurationArguments) {
        this.clientId = apiConfigurtionArguments.clientId
        this.clientSecret = apiConfigurtionArguments.clientSecret
        this.baseUrl = apiConfigurtionArguments.baseUrl
    }
}