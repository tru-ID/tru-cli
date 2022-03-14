export type IGlobalAuthConfiguration = {
  selectedWorkspace?: string

  selectWorkspaceDataResidency?: string

  tokenInfo?: TokenInfo

  apiLoginUrlOverride?: string

  apiBaseUrlOverride?: string

  [index: string]: any
}

export type TokenInfo = {
  refresh_token: string
  scope: string
}
