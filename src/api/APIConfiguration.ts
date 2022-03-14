export type APIClientCredentialsConfiguration = {
  clientId: string
  clientSecret: string
  scopes: string[]
  tokenUrl: string
}

export type APIRefreshTokenConfiguration = {
  refreshToken: string
  configLocation: string
  tokenUrl: string
  issuerUrl: string
}
