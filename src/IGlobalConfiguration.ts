export default interface IGlobalConfiguration{
    /**
     * The default workspace `client_id`
     */
    defaultWorkspaceClientId?: string

    /**
     * The default workspace `client_secret`
     */
    defaultWorkspaceClientSecret?: string

    /**
     * The default workspace data residency. Unless the `apiBaseUrlOverride` is set the
     * `defaultWorkspaceDataResidency` will be used in determining the data residency of
     * the API endpoints to use in API interactions.
     * 
     * Example: if `defaultWorkspaceDataResidency` has a value of `eu` then https://{defaultWorkspaceDataResidency}.api.4auth.io
     */
    defaultWorkspaceDataResidency?: string


    // apiBaseUrlOverride?: string
    [index: string]: any
}