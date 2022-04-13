export type IGlobalAuthConfiguration = {
  selectedWorkspace?: string

  selectedWorkspaceDataResidency?: string

  tokenInfo?: TokenInfo

  apiLoginUrlOverride?: string

  apiBaseUrlPattern?: string

  [index: string]: any
}

export type TokenInfo = {
  refreshToken: string
  scope: string
}
