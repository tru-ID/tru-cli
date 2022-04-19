import { IGlobalAuthConfiguration } from './IGlobalAuthConfiguration'

export const LOGIN_BASE_URL_DEFAULT = 'https://login.tru.id'
export const API_BASE_URL_PATTERN = 'https://DATA_RESIDENCY.api.tru.id' // DATA RESIDENCY should be always in this pattern to be replaced.

export const loginBaseUrl = (config: IGlobalAuthConfiguration): string => {
  return config.apiLoginUrlOverride
    ? config.apiLoginUrlOverride
    : LOGIN_BASE_URL_DEFAULT
}

export const authorizationUrl = (loginUrl: string, provider: string): string =>
  `${loginUrl}/oauth2/auth?provider_id=${provider}`

export const jkwsUri = (jwsBaseUri: string): string =>
  `${jwsBaseUri}/.well-known/jwks.json`

export const issuerUrl = (config: IGlobalAuthConfiguration): string => {
  return loginBaseUrl(config)
}

export const userinfo = (config: IGlobalAuthConfiguration): string => {
  return `${loginBaseUrl(config)}/login/userinfo`
}

export const workspaceTokenUrl = (loginUrl: string): string =>
  `${loginUrl}/oauth2/token`

const apiBaseUrlPattern = (config: IGlobalAuthConfiguration): string => {
  return config.apiBaseUrlPattern
    ? config.apiBaseUrlPattern
    : API_BASE_URL_PATTERN
}

export const apiBaseUrlDR = (
  dataResidency: string,
  config: IGlobalAuthConfiguration,
): string => {
  return apiBaseUrlPattern(config).replace(
    'DATA_RESIDENCY',
    dataResidency ? dataResidency : '',
  )
}

export const tokenUrlDR = (
  dataResidency: string,
  config: IGlobalAuthConfiguration,
): string => {
  return `${apiBaseUrlDR(dataResidency, config)}/oauth2/v1/token`
}
