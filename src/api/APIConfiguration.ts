export declare interface APIConfigurationArguments {
    clientId?:string,
    clientSecret?:string,
    scopes?:string[],
    baseUrl?:string, // https://eu.api.tru.id
}

export class APIConfiguration {
    clientId?: string
    clientSecret?: string
    scopes?: string
    baseUrl?: string
    private axios: any

    constructor(apiConfigurtionArguments: APIConfigurationArguments) {
        this.clientId = apiConfigurtionArguments.clientId
        this.clientSecret = apiConfigurtionArguments.clientSecret
        this.scopes = apiConfigurtionArguments.scopes?.join(' ')
        this.baseUrl = apiConfigurtionArguments.baseUrl
    }
}
