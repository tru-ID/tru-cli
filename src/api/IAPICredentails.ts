export default interface IAPICredentials {
    client_id: string,
    client_secret?: string,
    created_at: string,
    scopes?: Array<string>
}