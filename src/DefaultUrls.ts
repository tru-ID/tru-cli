import { IGlobalAuthConfiguration } from './IGlobalAuthConfiguration'

export const LOGIN_BASE_URL_DEFAULT = 'https://login.tru.id'
export const API_BASE_URL_PATTERN = 'https://DATA_RESIDENCY.api.tru.id' // DATA RESIDENCY should be always in this pattern to be replaced.

export const loginBaseUrl = (config: IGlobalAuthConfiguration): string => {
  return config.apiLoginUrlOverride
    ? config.apiLoginUrlOverride
    : LOGIN_BASE_URL_DEFAULT
}

export const oauthUrl = (loginUrl: string, provider: string): string =>
  `${loginUrl}/oauth2/auth?provider_id=${provider}`

export const jkwsUri = (jwsBaseUri: string): string =>
  `${jwsBaseUri}/.well-known/jwks.json`

export const tokenUrl = (loginUrl: string): string => `${loginUrl}/oauth2/token`

export const issuerUrl = (config: IGlobalAuthConfiguration): string => {
  return loginBaseUrl(config)
}

export const apiBaseUrlPattern = (config: IGlobalAuthConfiguration) => {
  return config.apiBaseUrlPattern
    ? config.apiBaseUrlPattern
    : API_BASE_URL_PATTERN
}

export const apiBaseUrlDR = (config: IGlobalAuthConfiguration): string => {
  return apiBaseUrlPattern(config).replace(
    'DATA_RESIDENCY',
    config.selectedWorkspaceDataResidency
      ? config.selectedWorkspaceDataResidency
      : '',
  )
}

export const apiBaseUrlDRString = (
  dataResidency: string,
  config: IGlobalAuthConfiguration,
): string => {
  return apiBaseUrlPattern(config).replace('DATA_RESIDENCY', dataResidency)
}

export const tokenUrlDR = (config: IGlobalAuthConfiguration): string => {
  return `${apiBaseUrlDR(config)}/oauth2/v1/token`
}

export const userinfo = (config: IGlobalAuthConfiguration): string => {
  return `${loginBaseUrl(config)}/login/userinfo`
}
