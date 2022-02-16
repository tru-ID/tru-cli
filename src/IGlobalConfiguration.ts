export default interface IGlobalConfiguration {
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
   * Example: if `defaultWorkspaceDataResidency` has a value of `eu` then https://{defaultWorkspaceDataResidency}.api.tru.id
   */
  defaultWorkspaceDataResidency?: string

  /**
   * If present, the `defaultWorkspaceDataResidency` configuration value should not be used to generate data residency specific API endpoints.
   * Instead, the full value of `apiBaseUrlOverride` should be used as the base URL.
   */
  apiBaseUrlOverride?: string

  /**
   * Allow configuration values to be iterated over
   */
  [index: string]: any
}
