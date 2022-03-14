import { IGlobalAuthConfiguration } from '../IGlobalAuthConfiguration'
import { IProjectConfiguration } from '../IProjectConfiguration'

export function doesProjectConfigExist(
  projectConfig?: IProjectConfiguration,
): void {
  if (!projectConfig) {
    throw new Error(
      'Please provide a valid directory path or run `tru projects:create` to create a project and associated configuration file.',
    )
  }
}

export function isProjectCredentialsValid(
  projectConfig: IProjectConfiguration,
): void {
  const credentials = projectConfig.credentials[0]
  if (!credentials) {
    throw new Error('missing project credentials')
  }

  if (!credentials.client_id) {
    throw new Error('missing project credentials')
  }

  if (!credentials.client_secret) {
    throw new Error('missing project credentials')
  }
}

export function isWorkspaceSelected(
  globalConfig: IGlobalAuthConfiguration,
): void {
  if (!globalConfig.selectWorkspaceDataResidency) {
    throw new Error(
      'Missing selectWorkspaceDataResidency please select workspace workspaces:switch',
    )
  }

  if (!globalConfig.selectedWorkspace) {
    throw new Error(
      'Missing selectedWorkspace please select workspace workspaces:switch',
    )
  }
}

export function isWorkspaceTokenInfoValid(
  globalConfig: IGlobalAuthConfiguration,
): void {
  if (!globalConfig.tokenInfo) {
    throw new Error('Missing tokens please run setup:oauth2')
  }

  if (!globalConfig.tokenInfo.refresh_token) {
    throw new Error('Missing tokens please run setup:oauth2')
  }

  if (!globalConfig.tokenInfo.scope) {
    throw new Error('Missing tokens please run setup:oauth2')
  }
}
