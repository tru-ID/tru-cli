import { IGlobalAuthConfiguration } from './IGlobalAuthConfiguration'

export const LOGIN_BASE_URL_DEFAULT = 'https://login.tru.id' // hq login endpoint- but now it points to customer-gw (not sure i understand why)

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

export const apiBaseUrlDR = (config: IGlobalAuthConfiguration): string => {
  return config.apiBaseUrlOverride
    ? config.apiBaseUrlOverride
    : apiBaseUrlDRString(config.selectWorkspaceDataResidency!)
}

export const apiBaseUrlDRString = (dataResidency: string): string => {
  return `https://${dataResidency}.api.tru.id`
}

export const tokenUrlDR = (config: IGlobalAuthConfiguration): string => {
  return `${apiBaseUrlDR(config)}/oauth2/v1/token`
}

export const userinfo = (config: IGlobalAuthConfiguration): string => {
  return `${loginBaseUrl(config)}/login/userinfo`
}
